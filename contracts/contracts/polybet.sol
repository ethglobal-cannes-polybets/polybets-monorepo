// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

contract PolyBet is SiweAuth {
    event BetSlipCreated(
        uint256 indexed betId, uint256 totalCollateralAmount, bytes32[] marketplaceIds, bytes32[] marketIds
    );

    enum BetSlipStrategy {
        MaximizeShares, // (Default) Bet router places bets with consideration of price impact, and calculates the best way to maximize shares
        MaximizePrivacy // Bet router will put in pauses and rotate wallets to maximize privacy, user must pay a fee. Will only do non-functoinal PoC impl in hackathon.

    }

    enum BetSlipStatus {
        Pending, // Be,tSlip hasn't been processed by BetRouter
        Processing, // BetSlip is being processed by BetRouter
        Failed, // BetSlip has been processed by BetRouter and failed
        Placed, // BetSlip has been processed by BetRouter and succeeded
        Closed // Set when all proxied bets in the bet slip are closed

    }

    enum BetOutcome {
        None,
        Placed,
        Failed, // Set when we cannot possibly place a bet on the market, such as if the market doesn't exist on the provided marketplace
        Sold, // Set when user sells 100% of their shares in a bet.
        Won,
        Lost,
        Draw,
        Void
    }

    enum ChainFamily {
        EVM,
        SVM
    }

    enum PricingStrategy {
        ORDERBOOK,
        AMM,
        LMSR
    }

    struct Marketplace {
        uint256 warpRouterId;
        uint256 chainId;
        ChainFamily chainFamily;
        string name;
        string marketplaceProxy; // The proxy might be a solana address, so I don't think we can use the "address" type here
        PricingStrategy pricingStrategy; // "orderbook" or "amm" or "lmsr" - Only LMSR planned to be supported at hackathon
    }

    struct SubBet {
        bytes32 proxiedBetId; // Reference to the proxied bet
    }

    struct BetSlip {
        BetSlipStrategy strategy;
        uint256 initialCollateral; // The amount for the bet router to distribute to markets
        uint256 finalCollateral; // Informative field, updated when a proxied bet is sold/closed
        string failureReason; // Gets populated if we can't handle the betslip in the bet router.
        BetOutcome outcome;
        BetSlipStatus status;
    }
    // SubBet[] proxiedBets;   // The bets we actually placed on markets

    struct ProxiedBet {
        //Immutable fields set on bet creation
        bytes32 id;
        bytes32 betSlipId;
        bytes32 marketplaceId;
        bytes32 marketId;
        uint256 optionIndex;
        uint256 minimumShares; //Ignore this for the hackathon
        uint256 blockTimestamp; // Just for easier sorting when manually troubleshooting.
        // Mutable fields that are updated after placing bet on target
        uint256 originalCollateralAmount; // The collateralAmount that was spent by the BetRouter to place the bet.
        uint256 finalCollateralAmount; // Set to 0 initially. Final value will be set when market is closed, will be 0 if the user won, the collateral amount on void or draw, and the winning amount on win.
        uint256 sharesBought;
        uint256 sharesSold; // Don't worry about partially selling shares in hackathon
        BetOutcome outcome;
        string failureReason; // Gets populated if we can't handle the betslip in the bet router.
    }

    uint256 nextMarketplaceId;
    Marketplace[] public marketplaces;

    mapping(uint256 => uint256) public marketIdMapping;

    uint256 private nextBetId;
    mapping(uint256 => BetSlip) public betSlips;
    mapping(address => uint256[]) public userActiveBetSlips;
    mapping(address => uint256[]) public userClosedBetSlips;
    mapping(address => uint256) public userBalances;
    mapping(uint256 => ProxiedBet) public proxiedBets;

    constructor() SiweAuth("PolyBet") {}

    function placeBet(
        BetSlipStrategy strategy,
        uint256 totalCollateralAmount,
        bytes32[] memory marketplaceIds,
        bytes32[] memory marketIds
    ) external {
        require(marketplaceIds.length == marketIds.length, "Array lengths must match");

        uint256 betSlipId = nextBetId;
        nextBetId++;

        betSlips[betSlipId] = BetSlip({
            strategy: strategy,
            initialCollateral: totalCollateralAmount,
            finalCollateral: 0,
            failureReason: "",
            outcome: BetOutcome.None,
            status: BetSlipStatus.Pending
        });
        // proxiedBets: new SubBet[](0),

        userActiveBetSlips[msg.sender].push(betSlipId);
        userBalances[msg.sender] += totalCollateralAmount;
        emit BetSlipCreated(betSlipId, totalCollateralAmount, marketplaceIds, marketIds);
    }

    function getUserActiveBetslips() external view returns (uint256[] memory) {
        require(msg.sender != address(0), "Authentication required");
        return userActiveBetSlips[msg.sender];
    }

    function getUserActiveBetslips(bytes memory authToken) external view returns (uint256[] memory) {
        address userAddress = authMsgSender(authToken);
        return userActiveBetSlips[userAddress];
    }

    function getUserClosedBets() external view returns (uint256[] memory) {
        require(msg.sender != address(0), "Authentication required");
        return userClosedBetSlips[msg.sender];
    }

    function getUserClosedBets(bytes memory authToken) external view returns (uint256[] memory) {
        address userAddress = authMsgSender(authToken);
        return userClosedBetSlips[userAddress];
    }

    function getUserBalance() external view returns (uint256) {
        require(msg.sender != address(0), "Authentication required");
        return userBalances[msg.sender];
    }

    function getUserBalance(bytes memory authToken) external view returns (uint256) {
        address userAddress = authMsgSender(authToken);
        return userBalances[userAddress];
    }

    function getBetSlip(uint256 betSlipId) external view returns (BetSlip memory) {
        return betSlips[betSlipId];
    }

    function getProxiedBet(uint256 betId) external view returns (ProxiedBet memory) {
        return proxiedBets[betId];
    }

    function addMarketplace(uint64 chainId, ChainFamily family, string memory name, string memory marketplaceProxy)
        public
    {
        uint256 marketplaceId = nextMarketplaceId;
        ++nextMarketplaceId;
        marketplaces.push(
            Marketplace({
                warpRouterId: 0,
                chainId: chainId,
                chainFamily: family,
                name: name,
                marketplaceProxy: marketplaceProxy,
                pricingStrategy: PricingStrategy.LMSR
            })
        );
    }

    function getMarketplace(uint256 marketplaceId) external view returns (Marketplace memory) {
        return marketplaces[marketplaceId];
    }

    //TODO This is a stub that might not be used in end product, used to test bet router
    function updateBetSlipStatus(uint256 betSlipId, BetSlipStatus status) external {
        //TODO In the prod version require this to come from BetRouter ROFL https://github.com/oasisprotocol/oasis-sdk/blob/main/examples/runtime-sdk/rofl-oracle/oracle/contracts/Oracle.sol#L32
        betSlips[betSlipId].status = status;
    }
}

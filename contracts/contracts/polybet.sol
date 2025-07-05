// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PolyBet is SiweAuth, Ownable {
    using SafeERC20 for IERC20;
    IERC20 public musdcToken;
    
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
        BetOutcome outcome;
        BetSlipStatus status;
        string failureReason; // Gets populated if we can't handle the betslip in the bet router.
        bytes32[] marketplaceIds;
        bytes32[] marketIds;
        bytes32[] proxiedBets;   // The bets we actually placed on markets
    }

    struct ProxiedBet {
        //Immutable fields set on bet creation
        bytes32 id;
        uint256 betSlipId;
        uint256 marketplaceId;
        uint256 marketId;
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

    uint256 collateralAmount;
    Marketplace[] public marketplaces;
    BetSlip[] public betSlips;
    mapping(uint256 => address) private betslipsToBettor;
    mapping(address => uint256[]) public userActiveBetSlips;
    mapping(address => uint256[]) public userClosedBetSlips;
    mapping(address => uint256) private userBalances;
    mapping(bytes32 => ProxiedBet) public proxiedBets;

    constructor() SiweAuth("PolyBet") {
    }

    function placeBet(
        BetSlipStrategy strategy,
        uint256 totalCollateralAmount,
        bytes32[] memory marketplaceIds,
        bytes32[] memory marketIds
    ) external {
        require(marketplaceIds.length == marketIds.length, "Array lengths must match");
        require(totalCollateralAmount > 0, "Collateral amount must be greater than 0");

        musdcToken.safeTransferFrom(msg.sender, address(this), totalCollateralAmount);
        
        uint256 betSlipId = betSlips.length;
        betSlips.push(BetSlip({
            strategy: strategy,
            initialCollateral: totalCollateralAmount,
            finalCollateral: 0,
            outcome: BetOutcome.None,
            status: BetSlipStatus.Pending,
            failureReason: "",
            marketplaceIds: marketplaceIds,
            marketIds: marketIds,
            proxiedBets: new bytes32[](0)
        }));
        betslipsToBettor[betSlipId] = msg.sender;

        collateralAmount += totalCollateralAmount;
        userActiveBetSlips[msg.sender].push(betSlipId);
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

    function getProxiedBet(bytes32 betId) external view returns (ProxiedBet memory) {
        return proxiedBets[betId];
    }

    function addMarketplace(uint64 chainId, ChainFamily family, string memory name, string memory marketplaceProxy)
        public
    {
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

    function isClosed(BetOutcome outcome) internal pure returns (bool) {
      return outcome != BetOutcome.None && outcome != BetOutcome.Placed;
    }

    function initiateSellProxiedBets(
      BetSlipStrategy, 
      uint,
      uint,
      bool) public view onlyOwner {
        revert("not implemented");
    }

    function recordProxiedBetPlaced(
      uint betSlipId,
      ProxiedBet memory proxiedBet) public onlyOwner {
        betSlips[betSlipId].proxiedBets.push(proxiedBet.id);
        proxiedBets[proxiedBet.id] = proxiedBet;
    }

    function recordProxiedBetSold(
      uint,
      uint,
      uint) public view onlyOwner {
        revert("not implemented");
    }

    function recordProxiedBetClosed(
      bytes32 proxiedBetId,
      BetOutcome outcome,
      uint256 winningsCollateralValue) public onlyOwner {
        require(outcome != BetOutcome.None && outcome != BetOutcome.Sold);

        uint256 betSlipId = proxiedBets[proxiedBetId].betSlipId;
        address bettor = betslipsToBettor[betSlipId];
        BetSlip storage betSlip = betSlips[betSlipId];

        proxiedBets[proxiedBetId].outcome = outcome;
        proxiedBets[proxiedBetId].finalCollateralAmount = winningsCollateralValue;
        betSlip.finalCollateral += winningsCollateralValue;
        userBalances[bettor] += winningsCollateralValue;

        for (uint256 i = 0; i < betSlip.proxiedBets.length; i++) {
          if (!isClosed(proxiedBets[betSlip.proxiedBets[i]].outcome)) {
            return;
          }
        }
        
        // Remove betSlipId from user's active bet slips
        uint256[] storage activeBetSlips = userActiveBetSlips[bettor];
        for (uint256 i = 0; i < activeBetSlips.length; i++) {
            if (activeBetSlips[i] == betSlipId) {
                // Move last element to this position and remove last
                activeBetSlips[i] = activeBetSlips[activeBetSlips.length - 1];
                activeBetSlips.pop();
                break;
            }
        }
        
        // Add betSlipId to user's closed bet slips
        userClosedBetSlips[bettor].push(betSlipId);
    }
    
    // Withdraw function for users to claim their funds
    function withdrawWinnings(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        musdcToken.safeTransfer(msg.sender, amount);
    }

    function setCollateralToken(address _musdcToken) public onlyOwner {
        require(_musdcToken != address(0), "Invalid MUSDC token address");
        musdcToken = IERC20(_musdcToken);
    }
}

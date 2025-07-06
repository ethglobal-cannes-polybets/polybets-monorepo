// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PolyBet is SiweAuth, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public musdcToken;
    bytes21 public roflAppId;

    event BetSlipCreated(
        uint256 indexed betId,
        uint256 totalCollateralAmount,
        uint256 outcomeIndex,
        bytes32[] marketplaceIds,
        bytes32[] marketIds
    );

    event BetSlipSellingStateUpdate (
        uint256 indexed betId
    );

    enum BetSlipStrategy {
        MaximizeShares, // (Default) Bet router places bets with consideration of price impact, and calculates the best way to maximize shares
        MaximizePrivacy // Bet router will put in pauses and rotate wallets to maximize privacy, user must pay a fee. Will only do non-functoinal PoC impl in hackathon.
    }

    enum BetSlipStatus {
        Pending,
        Processing, // BetSlip is being processed by BetRouter
        Placed, // BetSlip has been processed by BetRouter and succeeded
        Selling,
        Failed, // BetSlip has been processed by BetRouter and failed
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

    struct BetSlip {
        BetSlipStrategy strategy;
        uint256 initialCollateral; // The amount for the bet router to distribute to markets
        uint256 finalCollateral; // Informative field, updated when a proxied bet is sold/closed
        uint256 outcomeIndex; // The index of the outcome that the bettor chose, at the betslip level for now because the marketplaces we want to support (polymarket, limitless) are all binary where 0 is yes and 1 is no
        uint256 parentId;
        bool instantArbitrage;
        BetSlipStatus status;
        string failureReason; // Gets populated if we can't handle the betslip in the bet router.
        bytes32[] marketplaceIds;
        bytes32[] marketIds;
        bytes32[] proxiedBets; // The bets we actually placed on markets
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

    constructor() SiweAuth("PolyBet") {}

    function placeBet(
        BetSlipStrategy strategy,
        uint256 totalCollateralAmount,
        uint256 outcomeIndex,
        bytes32[] memory marketplaceIds,
        bytes32[] memory marketIds,
        bool instantArbitrage,
        uint256 parentId
    ) external {
        require(marketplaceIds.length == marketIds.length, "array lengths must match");
        require(totalCollateralAmount > 0, "collateral amount must be greater than 0");

        // Check each marketplaceId is valid
        for (uint256 i = 0; i < marketplaceIds.length; i++) {
            uint256 marketplaceIdUint = uint256(marketplaceIds[i]);
            require(marketplaceIdUint < marketplaces.length, "invalid marketplace ID");
        }

        musdcToken.safeTransferFrom(msg.sender, address(this), totalCollateralAmount);

        uint256 betSlipId = betSlips.length;
        betSlips.push(
            BetSlip({
                strategy: strategy,
                initialCollateral: totalCollateralAmount,
                finalCollateral: 0,
                outcomeIndex: outcomeIndex,
                parentId: parentId,
                instantArbitrage: instantArbitrage,
                status: BetSlipStatus.Pending,
                failureReason: "",
                marketplaceIds: marketplaceIds,
                marketIds: marketIds,
                proxiedBets: new bytes32[](0)
            })
        );
        betslipsToBettor[betSlipId] = msg.sender;
        userActiveBetSlips[msg.sender].push(betSlipId);
        collateralAmount += totalCollateralAmount;
        emit BetSlipCreated(betSlipId, totalCollateralAmount, outcomeIndex, marketplaceIds, marketIds);
    }

    function getUserActiveBetslips() external view returns (uint256[] memory) {
        require(msg.sender != address(0), "authentication required");
        return userActiveBetSlips[msg.sender];
    }

    function getUserActiveBetslips(bytes memory authToken) external view returns (uint256[] memory) {
        address userAddress = authMsgSender(authToken);
        return userActiveBetSlips[userAddress];
    }

    function getUserClosedBets() external view returns (uint256[] memory) {
        require(msg.sender != address(0), "authentication required");
        return userClosedBetSlips[msg.sender];
    }

    function getUserClosedBets(bytes memory authToken) external view returns (uint256[] memory) {
        address userAddress = authMsgSender(authToken);
        return userClosedBetSlips[userAddress];
    }

    function getUserBalance() external view returns (uint256) {
        require(msg.sender != address(0), "authentication required");
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
        //TODO In the prod version require this to come from BetRouter ROFL
        // https://github.com/oasisprotocol/oasis-sdk/blob/main/examples/runtime-sdk/rofl-oracle/oracle/contracts/Oracle.sol#L32
        betSlips[betSlipId].status = status;
    }

    function _isClosed(BetOutcome outcome) internal pure returns (bool) {
        return outcome != BetOutcome.None && outcome != BetOutcome.Placed;
    }

    function _updateBettorBalance(bytes32 proxiedBetId, uint256 collateralValue) internal 
        returns (uint256 betSlipId, BetSlip storage betSlip, address bettor) {
        betSlipId = proxiedBets[proxiedBetId].betSlipId;
        bettor = betslipsToBettor[betSlipId];
        betSlip = betSlips[betSlipId];
        betSlip.finalCollateral += collateralValue;
        proxiedBets[proxiedBetId].finalCollateralAmount += collateralValue;
        userBalances[bettor] += collateralValue;
    }

    // Check to see if the bet slip is finished by looping through all proxy bets
    function _checkAndUpdateFinishedBetSlip(
        uint256 betSlipId, BetSlip storage betSlip, address bettor) internal {
        // Check if all proxied bets in the slip are closed
        for (uint256 i = 0; i < betSlip.proxiedBets.length; i++) {
            if (!_isClosed(proxiedBets[betSlip.proxiedBets[i]].outcome)) {
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

    function initiateSellProxiedBets(uint256 betSlipId) public onlyOwner {
        require(betSlipId < betSlips.length, "invalid bet slip id");
        require(betSlips[betSlipId].status == BetSlipStatus.Placed, "cannot cancel a bet thats not placed");
        betSlips[betSlipId].status = BetSlipStatus.Selling;
        emit BetSlipSellingStateUpdate(betSlipId);
    }

    function recordProxiedBetSold(
        bytes32 proxiedBetId, uint256 sharesSold, uint256 sharesSoldCollateralValue) public onlyOwner {
        if (roflAppId != 0)
          Subcall.roflEnsureAuthorizedOrigin(roflAppId);

        proxiedBets[proxiedBetId].sharesSold += sharesSold;
        require(proxiedBets[proxiedBetId].sharesBought >= proxiedBets[proxiedBetId].sharesSold,
                "cannot sell more shares than bought");

        if (proxiedBets[proxiedBetId].sharesBought == proxiedBets[proxiedBetId].sharesSold) {
            proxiedBets[proxiedBetId].outcome = BetOutcome.Sold;
            (uint256 betSlipId, BetSlip storage betSlip, address bettor) =
                _updateBettorBalance(proxiedBetId, sharesSoldCollateralValue);
            _checkAndUpdateFinishedBetSlip(betSlipId, betSlip, bettor);
        } else {
            _updateBettorBalance(proxiedBetId, sharesSoldCollateralValue);
        }
    }

    function recordProxiedBetPlaced(uint256 betSlipId, ProxiedBet memory proxiedBet) public onlyOwner {
        if (roflAppId != 0)
          Subcall.roflEnsureAuthorizedOrigin(roflAppId);

        betSlips[betSlipId].proxiedBets.push(proxiedBet.id);
        proxiedBets[proxiedBet.id] = proxiedBet;
    }

    function recordProxiedBetClosed(bytes32 proxiedBetId, BetOutcome outcome, uint256 winningsCollateralValue)
        public
        onlyOwner
    {
        require(outcome != BetOutcome.None && outcome != BetOutcome.Sold, "outcome cannot be none or sold");
        require(proxiedBets[proxiedBetId].outcome == BetOutcome.Placed, "invalid outcome transition");

        if (roflAppId != 0)
          Subcall.roflEnsureAuthorizedOrigin(roflAppId);

        proxiedBets[proxiedBetId].outcome = outcome;
        (uint256 betSlipId, BetSlip storage betSlip, address bettor) =
          _updateBettorBalance(proxiedBetId, winningsCollateralValue);
        _checkAndUpdateFinishedBetSlip(betSlipId, betSlip, bettor);

        if (betSlip.instantArbitrage && outcome == BetOutcome.Lost && winningsCollateralValue == 0) {
            betSlip.status = BetSlipStatus.Selling;
            emit BetSlipSellingStateUpdate(betSlipId);
        }
    }

    // Withdraw function for users to claim their funds
    function withdrawWinnings(uint256 amount) external {
        require(amount > 0, "amount must be greater than 0");
        require(userBalances[msg.sender] >= amount, "insufficient balance");
        userBalances[msg.sender] -= amount;
        musdcToken.safeTransfer(msg.sender, amount);
    }

    function setCollateralToken(address _musdcToken) public onlyOwner {
        require(_musdcToken != address(0), "invalid MUSDC token address");
        musdcToken = IERC20(_musdcToken);
    }

    function setRoflAppId(bytes21 appId) public onlyOwner {
      roflAppId = appId;
    }
}

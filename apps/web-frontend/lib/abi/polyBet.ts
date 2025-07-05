export const polyBetAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "A13e_RevokedAuthToken",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweAuth_AddressMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweAuth_ChainIdMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweAuth_DomainMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweAuth_Expired",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweAuth_NotBeforeInFuture",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweParser_InvalidAddressLength",
    type: "error",
  },
  {
    inputs: [],
    name: "SiweParser_InvalidNonce",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "betId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalCollateralAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "outcomeIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "marketplaceIds",
        type: "bytes32[]",
      },
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "marketIds",
        type: "bytes32[]",
      },
    ],
    name: "BetSlipCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "chainId",
        type: "uint64",
      },
      {
        internalType: "enum PolyBet.ChainFamily",
        name: "family",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "marketplaceProxy",
        type: "string",
      },
    ],
    name: "addMarketplace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "betSlips",
    outputs: [
      {
        internalType: "enum PolyBet.BetSlipStrategy",
        name: "strategy",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "initialCollateral",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "finalCollateral",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "outcomeIndex",
        type: "uint256",
      },
      {
        internalType: "enum PolyBet.BetSlipStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "failureReason",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "domain",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betSlipId",
        type: "uint256",
      },
    ],
    name: "getBetSlip",
    outputs: [
      {
        components: [
          {
            internalType: "enum PolyBet.BetSlipStrategy",
            name: "strategy",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "initialCollateral",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "finalCollateral",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "outcomeIndex",
            type: "uint256",
          },
          {
            internalType: "enum PolyBet.BetSlipStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "failureReason",
            type: "string",
          },
          {
            internalType: "bytes32[]",
            name: "marketplaceIds",
            type: "bytes32[]",
          },
          {
            internalType: "bytes32[]",
            name: "marketIds",
            type: "bytes32[]",
          },
          {
            internalType: "bytes32[]",
            name: "proxiedBets",
            type: "bytes32[]",
          },
        ],
        internalType: "struct PolyBet.BetSlip",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "marketplaceId",
        type: "uint256",
      },
    ],
    name: "getMarketplace",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "warpRouterId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            internalType: "enum PolyBet.ChainFamily",
            name: "chainFamily",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "marketplaceProxy",
            type: "string",
          },
          {
            internalType: "enum PolyBet.PricingStrategy",
            name: "pricingStrategy",
            type: "uint8",
          },
        ],
        internalType: "struct PolyBet.Marketplace",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "betId",
        type: "bytes32",
      },
    ],
    name: "getProxiedBet",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "betSlipId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marketplaceId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marketId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "optionIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minimumShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "originalCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "finalCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sharesBought",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sharesSold",
            type: "uint256",
          },
          {
            internalType: "enum PolyBet.BetOutcome",
            name: "outcome",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "failureReason",
            type: "string",
          },
        ],
        internalType: "struct PolyBet.ProxiedBet",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserActiveBetslips",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "authToken",
        type: "bytes",
      },
    ],
    name: "getUserActiveBetslips",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "authToken",
        type: "bytes",
      },
    ],
    name: "getUserBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "authToken",
        type: "bytes",
      },
    ],
    name: "getUserClosedBets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserClosedBets",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum PolyBet.BetSlipStrategy",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    name: "initiateSellProxiedBets",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "siweMsg",
        type: "string",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "v",
            type: "uint256",
          },
        ],
        internalType: "struct SignatureRSV",
        name: "sig",
        type: "tuple",
      },
    ],
    name: "login",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "marketplaces",
    outputs: [
      {
        internalType: "uint256",
        name: "warpRouterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "enum PolyBet.ChainFamily",
        name: "chainFamily",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "marketplaceProxy",
        type: "string",
      },
      {
        internalType: "enum PolyBet.PricingStrategy",
        name: "pricingStrategy",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "musdcToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum PolyBet.BetSlipStrategy",
        name: "strategy",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "totalCollateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "outcomeIndex",
        type: "uint256",
      },
      {
        internalType: "bytes32[]",
        name: "marketplaceIds",
        type: "bytes32[]",
      },
      {
        internalType: "bytes32[]",
        name: "marketIds",
        type: "bytes32[]",
      },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "proxiedBets",
    outputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "betSlipId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "marketplaceId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "optionIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumShares",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "originalCollateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "finalCollateralAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sharesBought",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sharesSold",
        type: "uint256",
      },
      {
        internalType: "enum PolyBet.BetOutcome",
        name: "outcome",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "failureReason",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "proxiedBetId",
        type: "bytes32",
      },
      {
        internalType: "enum PolyBet.BetOutcome",
        name: "outcome",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "winningsCollateralValue",
        type: "uint256",
      },
    ],
    name: "recordProxiedBetClosed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betSlipId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "betSlipId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marketplaceId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "marketId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "optionIndex",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minimumShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "blockTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "originalCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "finalCollateralAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sharesBought",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sharesSold",
            type: "uint256",
          },
          {
            internalType: "enum PolyBet.BetOutcome",
            name: "outcome",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "failureReason",
            type: "string",
          },
        ],
        internalType: "struct PolyBet.ProxiedBet",
        name: "proxiedBet",
        type: "tuple",
      },
    ],
    name: "recordProxiedBetPlaced",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "recordProxiedBetSold",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_musdcToken",
        type: "address",
      },
    ],
    name: "setCollateralToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "betSlipId",
        type: "uint256",
      },
      {
        internalType: "enum PolyBet.BetSlipStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "updateBetSlipStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userActiveBetSlips",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userClosedBetSlips",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

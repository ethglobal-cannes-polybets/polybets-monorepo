export const polyBetAbi = [
  // Functions
  {
    inputs: [
      { name: "strategy", type: "uint8" },
      { name: "totalCollateralAmount", type: "uint256" },
      { name: "marketplaceIds", type: "bytes32[]" },
      { name: "marketIds", type: "bytes32[]" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserActiveBetslips",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "authToken", type: "bytes" }],
    name: "getUserActiveBetslips",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserClosedBets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "authToken", type: "bytes" }],
    name: "getUserClosedBets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "authToken", type: "bytes" }],
    name: "getUserBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "betSlipId", type: "uint256" }],
    name: "getBetSlip",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "strategy", type: "uint8" },
          { name: "initialCollateral", type: "uint256" },
          { name: "finalCollateral", type: "uint256" },
          { name: "failureReason", type: "string" },
          { name: "outcome", type: "uint8" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "betId", type: "uint256" }],
    name: "getProxiedBet",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "bytes32" },
          { name: "betSlipId", type: "bytes32" },
          { name: "marketplaceId", type: "bytes32" },
          { name: "marketId", type: "bytes32" },
          { name: "optionIndex", type: "uint256" },
          { name: "minimumShares", type: "uint256" },
          { name: "blockTimestamp", type: "uint256" },
          { name: "originalCollateralAmount", type: "uint256" },
          { name: "finalCollateralAmount", type: "uint256" },
          { name: "sharesBought", type: "uint256" },
          { name: "sharesSold", type: "uint256" },
          { name: "outcome", type: "uint8" },
          { name: "failureReason", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketplaceId", type: "uint256" }],
    name: "getMarketplace",
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "warpRouterId", type: "uint256" },
          { name: "chainId", type: "uint256" },
          { name: "chainFamily", type: "uint8" },
          { name: "name", type: "string" },
          { name: "marketplaceProxy", type: "string" },
          { name: "pricingStrategy", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "betSlipId", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    name: "updateBetSlipStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "siweMessage", type: "string" },
      {
        name: "sig",
        type: "tuple",
        components: [
          { name: "r", type: "bytes32" },
          { name: "s", type: "bytes32" },
          { name: "v", type: "uint256" },
        ],
      },
    ],
    name: "login",
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "betId", type: "uint256" },
      { name: "totalCollateralAmount", type: "uint256" },
      { name: "marketplaceIds", type: "bytes32[]" },
      { name: "marketIds", type: "bytes32[]" },
    ],
    name: "BetSlipCreated",
    type: "event",
  },
] as const; 
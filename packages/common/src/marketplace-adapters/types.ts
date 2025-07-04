export interface BuySharesArgs<TMarket> {
  marketId: TMarket;
  optionIndex: number; // The index of the outcome to bet on
  collateralAmount: number; // The amount of currency to spend
  // other args
}

export interface SellSharesArgs<TMarket> {
  marketId: TMarket;
  optionIndex: number; // The index of the outcome to sell
  amount: number; // The number of shares to sell
  // other args
}

export interface GetPricesArgs<TMarket> {
  marketId: TMarket;
  // other args
}

export interface ClaimPayoutArgs<TMarket> {
  marketId: TMarket;
  // other args
}

export interface MarketplaceAdapter<
  TMarket,
  TBuy extends BuySharesArgs<TMarket>,
  TSell extends SellSharesArgs<TMarket>,
  TPrice extends GetPricesArgs<TMarket>,
  TClaim extends ClaimPayoutArgs<TMarket>,
> {
  buyShares(args: TBuy): Promise<any>;
  sellShares(args: TSell): Promise<any>;
  getPrices(args: TPrice): Promise<[number, number] | Error>;
  claimPayout(args: TClaim): Promise<any>;
}

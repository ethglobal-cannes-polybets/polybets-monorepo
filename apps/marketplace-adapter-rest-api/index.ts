import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { loadMarketplaceConfigs } from "polybets-common";
import { SolanaMarketplaceAdapter } from "polybets-common/src/marketplace-adapters/solana-adapter";
import { z } from "zod";

const app = new Hono();

// Load marketplace configurations
const marketplaceConfigs = loadMarketplaceConfigs();

// Find configurations for each marketplace
const slaughterhouseConfig = marketplaceConfigs.find(
  (c) => c.name === "Slaughterhouse Predictions"
);
const terminalDegenConfig = marketplaceConfigs.find(
  (c) => c.name === "Terminal Degeneracy Labs"
);
const degenExecutionChamberConfig = marketplaceConfigs.find(
  (c) => c.name === "Degen Execution Chamber"
);
const nihilisticProphetSyndicateConfig = marketplaceConfigs.find(
  (c) => c.name === "Nihilistic Prophet Syndicate"
);

if (
  !slaughterhouseConfig ||
  !terminalDegenConfig ||
  !degenExecutionChamberConfig ||
  !nihilisticProphetSyndicateConfig
) {
  throw new Error("Marketplace configurations not found");
}

// Create adapter instances
const slaughterhouseAdapter = new SolanaMarketplaceAdapter(
  slaughterhouseConfig
);
const terminalDegenAdapter = new SolanaMarketplaceAdapter(terminalDegenConfig);
const degenExecutionChamberAdapter = new SolanaMarketplaceAdapter(
  degenExecutionChamberConfig
);
const nihilisticProphetSyndicateAdapter = new SolanaMarketplaceAdapter(
  nihilisticProphetSyndicateConfig
);

// Zod Schemas for validation
const BuySharesSchema = z.object({
  marketId: z.number(),
  optionIndex: z.number(),
  collateralAmount: z.number(),
});

const SellSharesSchema = z.object({
  marketId: z.number(),
  optionIndex: z.number(),
  amount: z.number(),
});

const GetPricesSchema = z.object({
  marketId: z.number(),
});

const ClaimPayoutSchema = z.object({
  marketId: z.number(),
});

// Helper to create routes for a marketplace
const createMarketplaceRoutes = (
  path: string,
  adapter: SolanaMarketplaceAdapter
) => {
  const route = new Hono();

  route.post("/buy-shares", zValidator("json", BuySharesSchema), async (c) => {
    const args = c.req.valid("json");
    const result = await adapter.buyShares(args);
    return c.json(result);
  });

  route.post(
    "/sell-shares",
    zValidator("json", SellSharesSchema),
    async (c) => {
      const args = c.req.valid("json");
      const result = await adapter.sellShares(args);
      return c.json(result);
    }
  );

  route.post("/get-prices", zValidator("json", GetPricesSchema), async (c) => {
    const args = c.req.valid("json");
    const result = await adapter.getPrices(args);
    if (result instanceof Error) {
      return c.json({ error: result.message }, 500);
    }
    return c.json(result);
  });

  route.post(
    "/claim-payout",
    zValidator("json", ClaimPayoutSchema),
    async (c) => {
      const args = c.req.valid("json");
      const result = await adapter.claimPayout(args);
      return c.json(result);
    }
  );

  return route;
};

// Create and register routes
const slaughterhouseRoutes = createMarketplaceRoutes(
  "/slaughterhouse-predictions",
  slaughterhouseAdapter
);
const terminalDegenRoutes = createMarketplaceRoutes(
  "/terminal-degeneracy-labs",
  terminalDegenAdapter
);
const degenExecutionChamberRoutes = createMarketplaceRoutes(
  "/degen-execution-chamber",
  degenExecutionChamberAdapter
);
const nihilisticProphetSyndicateRoutes = createMarketplaceRoutes(
  "/nihilistic-prophet-syndicate",
  nihilisticProphetSyndicateAdapter
);

app.route("/slaughterhouse-predictions", slaughterhouseRoutes);
app.route("/terminal-degeneracy-labs", terminalDegenRoutes);
app.route("/degen-execution-chamber", degenExecutionChamberRoutes);
app.route("/nihilistic-prophet-syndicate", nihilisticProphetSyndicateRoutes);

export default app;

import { hc } from "hono/client";

// Define minimal client interface we need
interface GetPricesEndpoint {
  $post: (args: { json: { marketId: number } }) => Promise<Response>;
}

interface AdapterClient {
  "get-prices": GetPricesEndpoint;
}

export interface MarketplacePriceClient {
  "slaughterhouse-predictions": AdapterClient;
  "terminal-degenerecy-labs": AdapterClient;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADAPTER_API_BASE ??
  "http://localhost:8787";

// Cast hc client to the minimal subset we actually use
export const marketplaceClient = hc(
  BASE_URL
) as unknown as MarketplacePriceClient;

export const slaughterhouseClient =
  marketplaceClient["slaughterhouse-predictions"];
export const terminalDegenClient =
  marketplaceClient["terminal-degenerecy-labs"];

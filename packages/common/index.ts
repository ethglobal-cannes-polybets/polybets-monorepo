// Core config and types - safe to import anywhere
// NOTE: Solana-specific functionality relies on Node.js built-ins (e.g. `fs`).
// It should only be imported in server-side / Node contexts.
// To avoid breaking Next.js / browser bundles, we no longer re-export it from the
// top-level barrel. Import it directly via
//   import { SolanaPoolManager } from "polybets-common/src/clients/solana-pool-manager";
// when needed on the server.
// export * from "./src/clients/solana-pool-manager";
export * from "./src/config";
export type { Database } from "./src/lib/__generated__/database.types";
export * from "./src/lib/config";
export * from "./src/lib/lmsr-calculator";
// export * from "./src/lib/supabase";
export * from "./src/marketplace-adapters/types";
export * from "./src/types";

// Optional Solana-specific exports - only import if needed
// export * from "./src/clients/solana-pool-manager";
// export * from "./src/lib/lmsr-calculator";
// export * from "./src/lib/supabase";
// export * from "./src/marketplace-adapters/solana-adapter";

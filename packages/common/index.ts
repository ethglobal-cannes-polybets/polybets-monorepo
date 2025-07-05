// Core config and types - safe to import anywhere
export * from "./src/clients/solana-pool-manager";
export * from "./src/config";
export type { Database } from "./src/lib/__generated__/database.types";
export * from "./src/lib/config";
export * from "./src/lib/lmsr-calculator";
export * from "./src/lib/supabase";
export * from "./src/marketplace-adapters/types";
export * from "./src/types";

// Optional Solana-specific exports - only import if needed
// export * from "./src/clients/solana-pool-manager";
// export * from "./src/lib/lmsr-calculator";
// export * from "./src/lib/supabase";
// export * from "./src/marketplace-adapters/solana-adapter";

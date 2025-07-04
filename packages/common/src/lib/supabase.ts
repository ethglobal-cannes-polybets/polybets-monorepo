import { createClient } from "@supabase/supabase-js";
import type { Database } from "./__generated__/database.types";
import { requireEnv } from "./config";

//Backend client
export const supabase = createClient<Database>(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_KEY")
);

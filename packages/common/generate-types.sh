#!/bin/bash

SUPABASE_PROJECT_ID="mwoiwlyksfcasvkmilxb"

npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > ./src/lib/__generated__/database.types.ts

# CD to ../contracts
# Run forge build
# mkdir -p ./types

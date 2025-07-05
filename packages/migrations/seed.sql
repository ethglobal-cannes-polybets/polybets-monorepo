-- Create the tables
-- Supabase GraphQL Schema Configuration
COMMENT ON SCHEMA public IS E'@graphql({"inflect_names": true, "max_rows": 100})';

-- Enum Type Definitions
CREATE TYPE PoolStatus AS ENUM (
  'NONE',
  'PENDING',
  'GRADED',
  'REGRADED',
  'LOCKED',
  'MIGRATED'
);

CREATE TYPE BetOutcome AS ENUM (
  'NONE',
  'WON',
  'LOST',
  'VOIDED',
  'DRAW'
);

CREATE TYPE TokenType AS ENUM (
  'USDC',
  'POINTS'
);

CREATE TYPE MediaType AS ENUM (
  'X',
  'TIKTOK',
  'INSTAGRAM',
  'FACEBOOK',
  'IMAGE',
  'VIDEO',
  'EXTERNAL_LINK'
);

-- Table Definitions

-- pools Table
CREATE TABLE pools (
  id BIGINT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  bets_close_at BIGINT NOT NULL,
  decision_time BIGINT NOT NULL,
  winning_option BIGINT NOT NULL,
  status PoolStatus NOT NULL,
  is_draw BOOLEAN NOT NULL,
  is_lmsr_pool BOOLEAN NOT NULL,
  created_at BIGINT NOT NULL,
  category TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  closure_criteria TEXT NOT NULL,
  closure_instructions TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type MediaType NOT NULL,
  creation_tx_hash TEXT NOT NULL,
  bc_yes_usdc_mint TEXT NOT NULL,
  bc_no_usdc_mint TEXT NOT NULL,
  bc_yes_points_mint TEXT NOT NULL,
  bc_no_points_mint TEXT NOT NULL,
  lmsr_yes_usdc_mint TEXT NOT NULL,
  lmsr_no_usdc_mint TEXT NOT NULL,
  lmsr_yes_points_mint TEXT NOT NULL,
  lmsr_no_points_mint TEXT NOT NULL,
  lmsr_yes_usdc_initial_liquidity BIGINT NOT NULL,
  lmsr_no_usdc_initial_liquidity BIGINT NOT NULL,
  lmsr_yes_points_initial_liquidity BIGINT NOT NULL,
  lmsr_no_points_initial_liquidity BIGINT NOT NULL,
  fee_rate_basis_points BIGINT NOT NULL,
  lmsr_migration_timestamp BIGINT NOT NULL,
  lmsr_pool_pda TEXT NOT NULL
);
COMMENT ON TABLE pools IS E'@graphql({"aggregate": {"enabled": true}})';


-- bonding_curve_bets Table
CREATE TABLE bonding_curve_bets (
  id BIGINT PRIMARY KEY,
  pool_id BIGINT NOT NULL REFERENCES pools(id),
  user_address TEXT NOT NULL,
  option_index BIGINT NOT NULL,
  amount BIGINT NOT NULL,
  minted_amount BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  is_paid_out BOOLEAN NOT NULL,
  outcome BetOutcome NOT NULL,
  payment_token_type TokenType NOT NULL,
  bc_token_mint TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  fee_paid BIGINT NOT NULL
);
COMMENT ON TABLE bonding_curve_bets IS E'@graphql({"aggregate": {"enabled": true}})';


-- lmsr_shares_bought_events Table (Event Table)
CREATE TABLE lmsr_shares_bought_events (
  id TEXT PRIMARY KEY,
  pool_id BIGINT NOT NULL REFERENCES pools(id),
  user_address TEXT NOT NULL,
  option_index BIGINT NOT NULL,
  payment_token_type TokenType NOT NULL,
  payment_amount BIGINT NOT NULL,
  fee_paid BIGINT NOT NULL,
  lmsr_token_mint TEXT NOT NULL,
  lmsr_tokens_minted BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
COMMENT ON TABLE lmsr_shares_bought_events IS E'@graphql({"aggregate": {"enabled": true}})';

-- lmsr_shares_sold_events Table (Event Table)
CREATE TABLE lmsr_shares_sold_events (
  id TEXT PRIMARY KEY,
  pool_id BIGINT NOT NULL REFERENCES pools(id),
  user_address TEXT NOT NULL,
  option_index BIGINT NOT NULL,
  payment_token_type TokenType NOT NULL,
  payment_amount BIGINT NOT NULL,
  fee_paid BIGINT NOT NULL,
  lmsr_token_mint TEXT NOT NULL,
  lmsr_tokens_burned BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
COMMENT ON TABLE lmsr_shares_sold_events IS E'@graphql({"aggregate": {"enabled": true}})';

-- lmsr_payout_claimed_events Table (Event Table)
CREATE TABLE lmsr_payout_claimed_events (
  id TEXT PRIMARY KEY,
  pool_id BIGINT NOT NULL REFERENCES pools(id),
  user_address TEXT NOT NULL,
  lmsr_token_mint_redeemed TEXT NOT NULL,
  payment_token_type TokenType NOT NULL,
  lmsr_tokens_redeemed BIGINT NOT NULL,
  payout_amount BIGINT NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
COMMENT ON TABLE lmsr_payout_claimed_events IS E'@graphql({"aggregate": {"enabled": true}})';

-- processed_slots_tracker Table
CREATE TABLE IF NOT EXISTS processed_slots_tracker (
    program_id TEXT PRIMARY KEY,
    last_processed_slot BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE processed_slots_tracker IS E'@graphql({"aggregate": {"enabled": true}})';

-- Trigger function to update `updated_at` timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for processed_slots_tracker
CREATE TRIGGER set_timestamp_processed_slots_tracker
BEFORE UPDATE ON processed_slots_tracker
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Row Level Security (RLS)
-- Note: service_role bypasses RLS by default in Supabase.

ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on pools" ON pools FOR SELECT TO anon USING (true);


ALTER TABLE bonding_curve_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on bonding_curve_bets" ON bonding_curve_bets FOR SELECT TO anon USING (true);



ALTER TABLE lmsr_shares_bought_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on lmsr_shares_bought_events" ON lmsr_shares_bought_events FOR SELECT TO anon USING (true);

ALTER TABLE lmsr_shares_sold_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on lmsr_shares_sold_events" ON lmsr_shares_sold_events FOR SELECT TO anon USING (true);

ALTER TABLE lmsr_payout_claimed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on lmsr_payout_claimed_events" ON lmsr_payout_claimed_events FOR SELECT TO anon USING (true);

ALTER TABLE processed_slots_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read access on processed_slots_tracker" ON processed_slots_tracker FOR SELECT TO anon USING (true);

-- Indexes
CREATE INDEX idx_bonding_curve_bet_pool_id ON bonding_curve_bets(pool_id);
CREATE INDEX idx_bonding_curve_bet_user_address ON bonding_curve_bets(user_address);

CREATE INDEX idx_lmsr_shares_bought_event_pool_id ON lmsr_shares_bought_events(pool_id);
CREATE INDEX idx_lmsr_shares_sold_event_pool_id ON lmsr_shares_sold_events(pool_id);
CREATE INDEX idx_lmsr_payout_claimed_event_pool_id ON lmsr_payout_claimed_events(pool_id);

CREATE INDEX idx_pool_status ON pools(status);
CREATE INDEX idx_pool_category ON pools(category);
CREATE INDEX idx_pool_creator_id ON pools(creator_id);

CREATE INDEX idx_processed_slots_tracker_program_id ON processed_slots_tracker(program_id); 

--- Make sure to run the following SQL files to create the views:

DROP FUNCTION IF EXISTS get_pool_details_for_user;
CREATE OR REPLACE FUNCTION get_pool_details_for_user(target_user_address TEXT)
RETURNS TABLE(
    pool_id BIGINT,
    token_type tokentype,
    option_index BIGINT,
    bc_payment_token_amount NUMERIC,
    bc_option_token_supply NUMERIC,
    lmsr_option_token_supply NUMERIC,
    lmsr_payment_token_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
   SELECT pools.id,
           COALESCE(bc.payment_token_type, lmsr_buy.payment_token_type, lmsr_sell.payment_token_type) payment_token_type,
           COALESCE(bc.option_index, lmsr_buy.option_index, lmsr_sell.option_index) option_index,
           COALESCE(SUM(bc.minted_amount), 0) bc_option_token_supply,
           COALESCE(SUM(bc.amount), 0) bc_payment_token_amount,
           COALESCE(SUM(lmsr_buy.lmsr_tokens_minted), 0) - COALESCE(SUM(lmsr_sell.lmsr_tokens_burned), 0) lmsr_option_token_supply,
           COALESCE(SUM(lmsr_buy.payment_amount), 0) - COALESCE(SUM(lmsr_sell.payment_amount), 0) lmsr_payment_token_amount
    FROM pools 
    LEFT JOIN bonding_curve_bets bc ON bc.pool_id = pools.id AND bc.user_address = 'FocZqaUp5NezW1JW5sY9kEtK7wbaUybGgzHNZxixBc18'
    LEFT JOIN lmsr_shares_bought_events lmsr_buy ON lmsr_buy.pool_id = pools.id AND lmsr_buy.user_address = 'FocZqaUp5NezW1JW5sY9kEtK7wbaUybGgzHNZxixBc18'
    LEFT JOIN lmsr_shares_sold_events lmsr_sell ON lmsr_sell.pool_id = pools.id AND lmsr_sell.user_address = 'FocZqaUp5NezW1JW5sY9kEtK7wbaUybGgzHNZxixBc18'
    WHERE bc.pool_id IS NOT NULL -- Only return records where the user has betting activity
    OR lmsr_buy.pool_id IS NOT NULL 
    OR lmsr_sell.pool_id IS NOT NULL -- Can happen if a user cashes in tokens transferred to them by some buyer
    GROUP BY pools.id, COALESCE(bc.payment_token_type, lmsr_buy.payment_token_type, lmsr_sell.payment_token_type), COALESCE(bc.option_index, lmsr_buy.option_index, lmsr_sell.option_index);
END;
$$ LANGUAGE plpgsql;


DROP VIEW IF EXISTS pool_details_view;
CREATE OR REPLACE VIEW pool_details_view AS
SELECT pools.id pool_id,
pools.question,
pools.options,
pools.status,
pools.media_url,
pools.media_type,
pools.category,
pools.creator_id,
pools.creator_name,
pools.bets_close_at,
pools.decision_time,
pools.is_draw,
pools.winning_option,
pools.created_at,
pools.is_lmsr_pool,
pools.lmsr_yes_usdc_mint,
pools.lmsr_no_usdc_mint,
pools.lmsr_yes_points_mint,
pools.lmsr_no_points_mint,
pools.bc_yes_usdc_mint,
pools.bc_no_usdc_mint,
pools.bc_yes_points_mint,
pools.bc_no_points_mint,
pools.lmsr_pool_pda,
COALESCE(bc.payment_token_type, lmsr_buy.payment_token_type, lmsr_sell.payment_token_type) token_type,
COALESCE(bc.option_index, lmsr_buy.option_index, lmsr_sell.option_index) option_index,
pools.lmsr_yes_usdc_initial_liquidity,
pools.lmsr_no_usdc_initial_liquidity,
pools.lmsr_yes_points_initial_liquidity,
pools.lmsr_no_points_initial_liquidity,
COALESCE(SUM(bc.amount), 0) bc_payment_token_amount,
COALESCE(SUM(bc.minted_amount), 0) bc_option_token_supply,
COALESCE(SUM(lmsr_buy.lmsr_tokens_minted), 0) - COALESCE(SUM(lmsr_sell.lmsr_tokens_burned), 0) lmsr_option_token_supply,
COALESCE(SUM(lmsr_buy.payment_amount), 0) - COALESCE(SUM(lmsr_sell.payment_amount), 0) lmsr_payment_token_amount,
0 bc_fee_paid, -- TODO: add bc fee paid to bonding_curve_bets table
COALESCE(SUM(lmsr_buy.fee_paid), 0) + COALESCE(SUM(lmsr_sell.fee_paid), 0) lmsr_fee_paid
FROM 
pools LEFT JOIN bonding_curve_bets bc ON bc.pool_id = pools.id
LEFT JOIN lmsr_shares_bought_events lmsr_buy ON lmsr_buy.pool_id = pools.id
LEFT JOIN lmsr_shares_sold_events lmsr_sell ON lmsr_sell.pool_id = pools.id
GROUP BY pools.id, pools.lmsr_pool_pda, COALESCE(bc.payment_token_type, lmsr_buy.payment_token_type, lmsr_sell.payment_token_type), COALESCE(bc.option_index, lmsr_buy.option_index, lmsr_sell.option_index);

-- Function to get pool details for a specific pool_id
-- TODO Very inefficient because the view selects and aggregates all pools, and then we're filtering by pool_id after that work has been done
CREATE OR REPLACE FUNCTION get_pool_details_for_single_pool(p_pool_id BIGINT)
RETURNS SETOF pool_details_view
LANGUAGE SQL
STABLE
AS $$
    SELECT * FROM pool_details_view WHERE pool_id = p_pool_id;
$$;



-- Markets table
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    common_question TEXT NOT NULL,
    options TEXT[2] NOT NULL DEFAULT ARRAY['Yes', 'No'],
    url TEXT
);

-- External markets table
CREATE TABLE external_markets (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    price_lookup_params JSONB,
    price_lookup_method TEXT CHECK (price_lookup_method IN ('canibeton-lmsr', 'polymarket-orderbook', 'limitless-orderbook')),
    parent_market INTEGER REFERENCES markets(id) ON DELETE CASCADE,
    marketplace_id INTEGER REFERENCES marketplaces(id) ON DELETE CASCADE,
    url TEXT
);

-- Marketplaces table
CREATE TABLE marketplaces (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    chain_id INTEGER,
    chain_name TEXT NOT NULL,
    chain_family TEXT CHECK (chain_family IN ('solana', 'evm')),
    warp_router_id TEXT,
    marketplace_proxy TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    address TEXT NOT NULL,
    price_strategy TEXT CHECK (price_strategy IN ('orderbook', 'amm', 'lmsr')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable Row Level Security on all tables
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for markets table
-- Service role: full CRUD access
CREATE POLICY "service_role_full_access_markets" ON markets
    FOR ALL USING (auth.role() = 'service_role');

-- Anon and authenticated: read access only
CREATE POLICY "anon_authenticated_read_markets" ON markets
    FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));

-- RLS Policies for external_markets table
-- Service role: full CRUD access
CREATE POLICY "service_role_full_access_external_markets" ON external_markets
    FOR ALL USING (auth.role() = 'service_role');

-- Anon and authenticated: read access only
CREATE POLICY "anon_authenticated_read_external_markets" ON external_markets
    FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));

-- RLS Policies for marketplaces table
-- Service role: full CRUD access
CREATE POLICY "service_role_full_access_marketplaces" ON marketplaces
    FOR ALL USING (auth.role() = 'service_role');

-- Anon and authenticated: read access only
CREATE POLICY "anon_authenticated_read_marketplaces" ON marketplaces
    FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));

-- Optional: Create indexes for better performance
CREATE INDEX idx_external_markets_parent_market ON external_markets(parent_market);
CREATE INDEX idx_marketplaces_chain_id ON marketplaces(chain_id);
CREATE INDEX idx_external_markets_price_lookup_method ON external_markets(price_lookup_method);

-- Seed data for marketplaces
INSERT INTO marketplaces (name, chain_id, chain_name, chain_family, address, price_strategy) VALUES
    ('PolyMarket', 137, 'polygon', 'evm', 'varied', 'orderbook'),
    ('Slaughterhouse Predictions', NULL, 'solana-devnet', 'solana', 'Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb', 'lmsr'),
    ('Terminal Degeneracy Labs', NULL, 'solana-devnet', 'solana', '9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY', 'lmsr'),
    ('Degen Execution Chamber', NULL, 'solana-devnet', 'solana', '4x33dYAwq2fprVaiakJjrGwxdu36JhJUCoegximvALyy', 'lmsr'),
    ('Nihilistic Prophet Syndicate', NULL, 'solana-devnet', 'solana', 'EWwuoaLcycGPMQWg8Xbyg5x2HVdNWgPF5AwZNRPibeWz', 'lmsr');


-- View for all lmsr_shares_bought_events from all variants
CREATE OR REPLACE VIEW public.shares_bought_all AS
SELECT
  'canibeton_variant1' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_minted,
  transaction_hash,
  created_at
FROM canibeton_variant1.lmsr_shares_bought_events

UNION ALL

SELECT
  'canibeton_variant2' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_minted,
  transaction_hash,
  created_at
FROM canibeton_variant2.lmsr_shares_bought_events

UNION ALL

SELECT
  'canibeton_variant3' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_minted,
  transaction_hash,
  created_at
FROM canibeton_variant3.lmsr_shares_bought_events

UNION ALL

SELECT
  'canibeton_variant4' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_minted,
  transaction_hash,
  created_at
FROM canibeton_variant4.lmsr_shares_bought_events;

-- View for all lmsr_shares_sold_events from all variants
CREATE OR REPLACE VIEW public.shares_sold_all AS
SELECT
  'canibeton_variant1' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_burned,
  transaction_hash,
  created_at
FROM canibeton_variant1.lmsr_shares_sold_events

UNION ALL

SELECT
  'canibeton_variant2' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_burned,
  transaction_hash,
  created_at
FROM canibeton_variant2.lmsr_shares_sold_events

UNION ALL

SELECT
  'canibeton_variant3' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_burned,
  transaction_hash,
  created_at
FROM canibeton_variant3.lmsr_shares_sold_events

UNION ALL

SELECT
  'canibeton_variant4' AS source_schema,
  id,
  pool_id,
  user_address,
  option_index,
  payment_token_type::TEXT AS payment_token_type,
  payment_amount,
  fee_paid,
  lmsr_token_mint,
  lmsr_tokens_burned,
  transaction_hash,
  created_at
FROM canibeton_variant4.lmsr_shares_sold_events;
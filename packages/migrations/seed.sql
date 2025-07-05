-- Create the tables

-- Markets table
CREATE TABLE markets (
    id SERIAL PRIMARY KEY,
    common_question TEXT NOT NULL,
    options TEXT[2] NOT NULL DEFAULT ARRAY['Yes', 'No']
);

-- External markets table
CREATE TABLE external_markets (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    price_lookup_params JSONB,
    price_lookup_method TEXT CHECK (price_lookup_method IN ('canibeton-lmsr', 'polymarket-orderbook', 'limitless-orderbook')),
    parent_market INTEGER REFERENCES markets(id) ON DELETE CASCADE
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
    ('Degen Execution Chamber', NULL, 'solana-devnet', 'solana', '0x0000000000000000000000000000000000000000', 'lmsr'),
    ('Nihilistic Prophet Syndicate', NULL, 'solana-devnet', 'solana', '0x0000000000000000000000000000000000000000', 'lmsr');


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
FROM canibeton_variant2.lmsr_shares_bought_events;

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
FROM canibeton_variant2.lmsr_shares_sold_events;
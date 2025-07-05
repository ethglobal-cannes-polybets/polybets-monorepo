


create table public.marketplaces (
  id serial not null,
  name text not null,
  chain_id integer null,
  chain_name text not null,
  chain_family text null,
  warp_router_id text null,
  marketplace_proxy text not null default '0x0000000000000000000000000000000000000000'::text,
  address text not null,
  price_strategy text null,
  active boolean null,
  constraint marketplaces_pkey primary key (id),
  constraint marketplaces_chain_family_check check (
    (
      chain_family = any (array['solana'::text, 'evm'::text])
    )
  ),
  constraint marketplaces_price_strategy_check check (
    (
      price_strategy = any (
        array['orderbook'::text, 'amm'::text, 'lmsr'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_marketplaces_chain_id on public.marketplaces using btree (chain_id) TABLESPACE pg_default;

-- Markets on our platform, used by the frontend to propose what markets to spread your bets on
create table public.marketplaces (
  id serial not null,
  name text not null,
  chain_id integer null,
  chain_name text not null,
  chain_family text null,
  warp_router_id text null,
  marketplace_proxy text not null default '0x0000000000000000000000000000000000000000'::text,
  address text not null,
  price_strategy text null,
  active boolean null,
  constraint marketplaces_pkey primary key (id),
  constraint marketplaces_chain_family_check check (
    (
      chain_family = any (array['solana'::text, 'evm'::text])
    )
  ),
  constraint marketplaces_price_strategy_check check (
    (
      price_strategy = any (
        array['orderbook'::text, 'amm'::text, 'lmsr'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_marketplaces_chain_id on public.marketplaces using btree (chain_id) TABLESPACE pg_default;

-- Markets on other platforms, used by the frontend to propose what markets to spread your bets on
create table public.external_markets (
  id serial not null,
  question text not null,
  price_lookup_params jsonb null,
  price_lookup_method text null,
  parent_market integer null,
  url text null,
  marketplace_id integer null,
  constraint external_markets_pkey primary key (id),
  constraint external_markets_marketplace_id_fkey foreign KEY (marketplace_id) references marketplaces (id) on update CASCADE on delete CASCADE,
  constraint external_markets_parent_market_fkey foreign KEY (parent_market) references markets (id) on delete CASCADE,
  constraint external_markets_price_lookup_method_check check (
    (
      price_lookup_method = any (
        array[
          'canibeton-lmsr'::text,
          'polymarket-orderbook'::text,
          'limitless-orderbook'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_external_markets_parent_market on public.external_markets using btree (parent_market) TABLESPACE pg_default;

create index IF not exists idx_external_markets_price_lookup_method on public.external_markets using btree (price_lookup_method) TABLESPACE pg_default;


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
    ('Degen Execution Chamber', NULL, 'solana-devnet', 'solana', '4XVwcwETMmcFcV33uBp66gQLd3AJpxd2qz7E2JTn5Jkm', 'lmsr'),
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


CREATE OR REPLACE VIEW canibeton_variant2.pool_lmsr_data_view AS
    with bought as (
      select pool_id, option_index, sum(lmsr_tokens_minted) as tokens_minted
      from canibeton_variant2.lmsr_shares_bought_events
      group by pool_id, option_index
    ),
    sold as (
      select pool_id, option_index, sum(lmsr_tokens_burned) as tokens_burned
      from canibeton_variant2.lmsr_shares_sold_events
      group by pool_id, option_index
    ),
    combined as (
      select
        pools.id as pool_id,
        pools.status,
        coalesce(b0.tokens_minted, 0) as lmsr_yes_tokens_minted,
        coalesce(s0.tokens_burned, 0) as lmsr_yes_tokens_burned,
        coalesce(b1.tokens_minted, 0) as lmsr_no_tokens_minted,
        coalesce(s1.tokens_burned, 0) as lmsr_no_tokens_burned,
        pools.lmsr_yes_usdc_initial_liquidity,
        pools.lmsr_no_usdc_initial_liquidity
      from canibeton_variant2.pools
      left join bought b0 on b0.pool_id = pools.id and b0.option_index = 0
      left join sold s0 on s0.pool_id = pools.id and s0.option_index = 0
      left join bought b1 on b1.pool_id = pools.id and b1.option_index = 1
      left join sold s1 on s1.pool_id = pools.id and s1.option_index = 1
    )
    select *,
           (lmsr_yes_tokens_minted - lmsr_yes_tokens_burned) as lmsr_yes_token_supply,
           (lmsr_no_tokens_minted - lmsr_no_tokens_burned) as lmsr_no_token_supply
    from combined;
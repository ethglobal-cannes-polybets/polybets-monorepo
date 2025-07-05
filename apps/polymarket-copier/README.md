# Polymarket Copier

A TypeScript application that copies markets from Polymarket, rephrases them using Claude AI, and creates corresponding pools on multiple Solana prediction marketplaces with seeded liquidity.

## Features

1. **Market Fetching**: Retrieves active markets from Polymarket API sorted by volume/liquidity
2. **AI-Powered Rephrasing**: Uses Claude Sonnet 4 via OpenRouter to rephrase markets for different audiences
3. **Multi-Marketplace Support**: Creates pools across multiple Solana marketplaces simultaneously
4. **Odds Variance**: Applies configurable variance (20-30%) to odds across marketplaces
5. **Automated Betting**: Seeds pools with 105 USDC distributed between Yes/No options
6. **Structured Output**: Uses LangChain with Zod schemas for reliable AI output parsing

## Architecture

### Core Components

- **PolymarketClient**: Handles API calls to fetch and parse market data
- **MarketRephraser**: Uses LangChain + OpenRouter to rephrase markets with structured output
- **SolanaPoolManager**: Manages pool creation and betting on Solana programs
- **PolymarketCopier**: Main orchestrator that coordinates the entire process

### Data Flow

```
Polymarket API → Fetch Markets → Rephrase with AI → Create Solana Pools → Place Bets
```

## Setup

### Prerequisites

- Node.js 18+ or Bun runtime
- Solana wallet with sufficient SOL and USDC
- OpenRouter API key for Claude access
- Deployed Solana prediction market programs

### Installation

```bash
cd polymarket-copier
bun install
```

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Solana Network Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
USDC_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# SportsBets Marketplace Configuration
SPORTS_PROGRAM_ID=your_sports_program_id_here
SPORTS_KEYPAIR=your_sports_keypair_base64_here
SPORTS_BETTING_POOLS_PDA=your_sports_betting_pools_pda_here
SPORTS_AUTHORITY=your_sports_authority_pubkey_here

# CryptoOracle Marketplace Configuration  
CRYPTO_PROGRAM_ID=your_crypto_program_id_here
CRYPTO_KEYPAIR=your_crypto_keypair_base64_here
CRYPTO_BETTING_POOLS_PDA=your_crypto_betting_pools_pda_here
CRYPTO_AUTHORITY=your_crypto_authority_pubkey_here
```

## Usage

### Running the Application

```bash
# Development mode with hot reloading
bun dev

# Production mode
bun start

# Build the application
bun run build
```

### Key Features

#### 1. Market Fetching & Filtering

The application fetches markets from Polymarket and applies intelligent filtering:

- Only active, non-expired markets
- Binary markets only (Yes/No outcomes)
- Minimum liquidity/volume thresholds
- Valid price ranges (0.01 to 0.99)

#### 2. AI-Powered Rephrasing

Uses Claude Sonnet 4 with a sophisticated prompt that:

- Maintains the core prediction while adapting language
- Tailors content to each marketplace's audience
- Preserves resolution criteria and timeframes
- Validates output using Zod schemas

Example rephrasing for different marketplaces:

**Original**: "Will Joe Biden get Coronavirus before the election?"

**SportsBets**: "Will President Biden Test Positive for COVID Before Election Day?"

**CryptoOracle**: "Biden COVID-19 Infection Probability Analysis: Pre-Election Assessment"

#### 3. Odds Variance System

Each marketplace gets slightly different odds to create authentic market dynamics:

- **SportsBets**: 15-25% variance from Polymarket odds
- **CryptoOracle**: 20-30% variance from Polymarket odds
- Random direction (higher or lower than original)
- Normalized to maintain valid probabilities

#### 4. Automated Pool Seeding

Each pool is seeded with 105 USDC distributed according to adjusted odds:

- If adjusted odds are 60% Yes / 40% No
- Yes bet: ~63 USDC, No bet: ~42 USDC
- Creates initial liquidity for other users to trade against

## Configuration

### Marketplace Configuration

Each marketplace is configured with:

```typescript
interface MarketplaceConfig {
  name: string;                    // Display name
  description: string;             // AI rephrasing context
  programId: string;              // Solana program ID
  keypair: string;                // Base64 encoded keypair
  rpcUrl: string;                 // Solana RPC endpoint
  usdcMintAddress: string;        // USDC token mint
  bettingPoolsPda: string;        // Program state PDA
  authority: string;              // Authority public key
  creatorName: string;            // Pool creator name
  creatorId: string;              // Pool creator ID
  oddsVarianceRange: [number, number]; // Variance range (e.g., [0.2, 0.3])
  betAmountUsdc: number;          // Total betting amount
}
```

### AI Prompt Engineering

The rephrasing prompt includes:

- **Original market context**: Question, description, outcomes, prices
- **Target marketplace context**: Name, description, audience
- **Rephrasing guidelines**: Maintain prediction, adapt language, ensure clarity
- **Validation rules**: Binary outcomes, reasonable length, appropriate category

## API Integration

### Polymarket API

Uses the Gamma Markets API:
- Endpoint: `https://gamma-api.polymarket.com/markets`
- Rate limiting: 100ms delay between requests
- Retry logic: 3 attempts with exponential backoff
- Sorting: By volume (descending)

### OpenRouter Integration

- Model: `anthropic/claude-3-5-sonnet-20241022`
- Temperature: 0.7 (balanced creativity/consistency)
- Structured output with Zod validation
- JSON parsing with error handling

## Error Handling

The application includes comprehensive error handling:

- **Network errors**: Retry logic with exponential backoff
- **API rate limits**: Automatic delay management
- **Validation errors**: Zod schema validation for AI output
- **Solana errors**: Transaction failure handling
- **Marketplace errors**: Individual marketplace isolation

## Monitoring & Logging

The application provides detailed logging:

```
🚀 Starting Polymarket Copier...
📡 Fetching markets from Polymarket...
✅ Found 12 valid markets out of 50 total
🎯 Processing market: "Will Bitcoin reach $100k by end of 2024?"
🔄 Rephrasing market for SportsBets Solana...
✅ Successfully rephrased market for SportsBets Solana
📝 New question: "Will Bitcoin Hit $100K Before 2025?"
🏗️  Creating pool for "Will Bitcoin Hit $100K Before 2025?" on SportsBets Solana...
✅ Pool created successfully! (Simulated)
💰 Placing bets on pool 123456 with 105 USDC...
📊 Betting breakdown:
   Yes: 67 USDC (63.8%)
   No: 38 USDC (36.2%)
   Variance: 8.3%
✅ Successfully processed market for SportsBets Solana
```

## Example Output

When processing a market about a tennis match:

**Original Polymarket**:
- Question: "Wimbledon: Majchrzak vs. Rinderknech"
- Outcomes: ["Majchrzak", "Rinderknech"]
- Prices: [0.46, 0.54]

**SportsBets Rephrasing**:
- Question: "Who Will Win: Majchrzak vs Rinderknech at Wimbledon?"
- Outcomes: ["Majchrzak Wins", "Rinderknech Wins"]
- Adjusted Odds: [0.52, 0.48] (13% variance)

**CryptoOracle Rephrasing**:
- Question: "Wimbledon Round 3 Match Outcome: Statistical Analysis"
- Outcomes: ["Majchrzak Victory", "Rinderknech Victory"]
- Adjusted Odds: [0.39, 0.61] (15% variance)

## Security Considerations

- **Private Keys**: Store keypairs as base64 in environment variables
- **API Keys**: Use environment variables, never commit to code
- **Rate Limiting**: Respect API limits to avoid IP bans
- **Validation**: Always validate AI output before using
- **Error Isolation**: Individual marketplace failures don't affect others

## Development

### Adding New Marketplaces

1. Add configuration to `loadMarketplaceConfigs()`
2. Set environment variables for new marketplace
3. Deploy Solana program if needed
4. Test with small amounts first

### Customizing Rephrasing

Modify the prompt template in `MarketRephraser.createPromptTemplate()` to:
- Change tone/style for different audiences
- Add industry-specific terminology
- Include additional context or instructions

### Extending Functionality

- **Market Filtering**: Add custom filters in `fetchPolymarkets()`
- **Betting Strategies**: Modify `calculateBettingParams()`
- **Monitoring**: Add external monitoring/alerting
- **Database**: Store results for analytics

## Troubleshooting

### Common Issues

1. **"No valid markets found"**: Check market filtering criteria
2. **"Marketplace validation failed"**: Verify Solana configuration
3. **"Rephrasing failed"**: Check OpenRouter API key and quota
4. **"Transaction failed"**: Ensure sufficient SOL/USDC balance

### Debug Mode

Set environment variables for more verbose logging:
```bash
DEBUG=1 bun start
```

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs for specific error messages
3. Verify all environment variables are set correctly
4. Test with a single marketplace first

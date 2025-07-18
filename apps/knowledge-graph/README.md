# PolyBets Knowledge Graph

This project creates a GRC-20 knowledge graph for the PolyBets betting platform, mapping relationships between Markets, Marketplaces, and External Markets using The Graph's GRC-20 framework.

## 🎉 **LIVE DEPLOYMENT**

✅ **Successfully deployed to The Graph Testnet!**

- **📄 IPFS CID**: `ipfs://bafkreihjshcs5eptkqurji33wafkmyzxqqqkzbl7t6yhng42vnhnutfxwe`
- **🔗 Transaction**: [`0x8ceb2d010af862fdb084b6e3da0febc5025d096c10657da9cb1a1b2dc735c08a`](https://geo-test.explorer.caldera.xyz/tx/0x8ceb2d010af862fdb084b6e3da0febc5025d096c10657da9cb1a1b2dc735c08a)
- **🌐 Network**: TESTNET
- **📍 Space ID**: `0e99e2a7-16e2-40a1-a751-8d45b02b9789`
- **📅 Published**: July 6, 2025 05:32 UTC

### 🔍 **View Your Knowledge Graph**

- **IPFS Gateway**: [View on IPFS](https://ipfs.io/ipfs/bafkreihjshcs5eptkqurji33wafkmyzxqqqkzbl7t6yhng42vnhnutfxwe)
- **Transaction Explorer**: [View Transaction](https://geo-test.explorer.caldera.xyz/tx/0x8ceb2d010af862fdb084b6e3da0febc5025d096c10657da9cb1a1b2dc735c08a)
- **The Graph Space**: [View Space](https://hypergraph-v2-testnet.up.railway.app/space/0e99e2a7-16e2-40a1-a751-8d45b02b9789)

### 📊 **Published Entities (18 Total)**

#### 🏪 **Core Markets (6)**
1. **Trump Nobel Prize Market** (`c5e35c68-6f8f-4025-af74-1c4fe5c896af`) - Political prediction: Will Donald Trump win the Nobel Peace Prize in 2025?
2. **Jay-Z Beyoncé Divorce Market** (`d53ee79d-8de8-409f-9a6d-07428719a484`) - Celebrity prediction: Will Jay-Z and Beyoncé divorce in 2025?
3. **Bird Flu Vaccine Market** (`bf63d6f9-dce9-4012-bd38-a45feb35e9f7`) - Health prediction: Will there be an FDA-approved bird flu vaccine in 2025?
4. **Ethereum $4K Market** (`05d16353-2044-4cdc-975f-3ef1eca52b5a`) - Crypto prediction: Will Ethereum reach $4,000 by December 31, 2025?
5. **US Bitcoin Reserve Market** (`81bbd49c-b7cc-489a-aa66-f23420eb5906`) - Policy prediction: Will the United States establish a national Bitcoin reserve in 2025?
6. **Gold $3200+ Market** (`3c66f670-5425-4b49-94a7-63e12caef590`) - Commodity prediction: Will gold close at $3,200 or higher at the end of 2025?

#### 🏬 **Marketplace Platforms (5)**
1. **PolyMarket** (`d44101d0-ec51-434a-a76a-c6902e4530c0`) - Major prediction market platform on Polygon blockchain with orderbook pricing
2. **Slaughterhouse Predictions** (`d3f50f6d-dd72-4d4a-b546-e2c6e20a81bc`) - Active prediction market on Solana with LMSR pricing and provocative branding
3. **Terminal Degeneracy Labs** (`5201f768-2bb5-4843-9cea-a6024ce6ad07`) - Solana marketplace specializing in contrarian questions for degen traders
4. **Degen Execution Chamber** (`45e88840-a0a9-4272-92cd-1f9779864d1f`) - High-stakes Solana marketplace with extreme descriptions
5. **Nihilistic Prophet Syndicate** (`cd4a8866-0eeb-4d23-8b8c-bfa643d66351`) - Dark-themed Solana marketplace focusing on pessimistic predictions

#### 🔗 **External Market Instances (6)**
1. **Trump Nobel on Slaughterhouse** (`4791d3f5-9d77-4c82-9672-8b24afee3fd6`) - "Will Trump shock the world and snag the Nobel Peace Prize in 2025?"
2. **Trump Nobel on Terminal Degeneracy** (`a1e2986f-884a-4def-a40e-7de3b4178b9f`) - "Will the orange man become a peace dove in 2025?"
3. **Jay-Z Divorce on Terminal Degeneracy** (`5290364f-70fa-44b3-892a-2c84ea5c70ba`) - "Will Bey finally say bye to Jay in 2025?"
4. **Bird Flu Vaccine on Degen Execution** (`79845070-ee0b-40f3-9664-ee953cec039c`) - "Can big pharma save us from bird flu with an FDA-approved vaccine in 2025?"
5. **Ethereum $4K on Slaughterhouse** (`ba870677-b194-4992-b929-39d26ed3dc20`) - "Will Ethereum get slaughtered at $4k before 2026?"
6. **Bitcoin Reserve on Terminal Degeneracy** (`733e948a-27de-4217-9c20-dfc53dd3785d`) - "Will the US government become a bitcoin hodler in 2025?"

#### 📋 **Summary Entity (1)**
- **PolyBets Knowledge Graph Summary** (`ac80e1a0-759e-4efa-99b7-acf8822be9a5`) - Comprehensive ecosystem overview mapping prediction markets, marketplace platforms, and their interconnections

## =� Data Model

### Entities

1. **Market** - Core betting markets with common questions
   - Properties: ID, Common Question, Options (Yes/No), URL
   - Example: "Will Donald Trump win Nobel Peace Prize in 2025?"

2. **Marketplace** - Betting platforms where external markets are hosted
   - Properties: ID, Name, Chain ID, Chain Name, Chain Family, Address, Price Strategy, Active Status
   - Examples: PolyMarket, Slaughterhouse Predictions, Terminal Degeneracy Labs

3. **ExternalMarket** - Specific market instances on marketplaces
   - Properties: ID, Question, Price Lookup Params, Price Lookup Method, Parent Market ID, Marketplace ID, URL
   - Links to parent Market and hosting Marketplace

### Relationships

- **Market** � **ExternalMarket**: One-to-many (hasExternalMarket/parentOf)
- **Marketplace** � **ExternalMarket**: One-to-many (hostedOnMarketplace)

## =� Setup

### Prerequisites

1. Install dependencies:
```bash
npm install @graphprotocol/grc-20
```

2. Set up environment variables in `.env`:
```bash
# Required
GRC20_SPACE_ID=your-space-id-here
PRIVATE_KEY=your-private-key-here

# Optional
NETWORK=TESTNET  # or MAINNET
USE_SMART_ACCOUNT=true  # for gas sponsorship
EDITOR_ADDRESS=0x...  # if different from private key address
```

### Getting Started

1. **Get a Geo Wallet** (for gas sponsorship):
   - Visit: https://www.geobrowser.io/export-wallet
   - Export your private key for sponsored transactions

2. **Create or Access a GRC-20 Space**:
   - Visit The Graph's GRC-20 platform
   - Create a new space or get access to an existing one
   - Note the Space ID

3. **Fund Your Wallet** (if not using smart account):
   - Testnet: Use faucet at https://faucet.conduit.xyz/geo-test-zc16z3tcvf
   - Mainnet: Ensure you have ETH for gas fees

## =' Usage

### Create Knowledge Graph

Generate the complete knowledge graph with all entities and relationships:

```typescript
import { createKnowledgeGraph } from './create-entities';

const ops = await createKnowledgeGraph();
console.log(`Generated ${ops.length} operations`);
```

### Publish to The Graph

Publish the knowledge graph to IPFS and The Graph:

```typescript
import { publishPolybetsKnowledgeGraph } from './publish-entities';

const result = await publishPolybetsKnowledgeGraph();
console.log(`Published: ${result.cid}`);
```

### Command Line Usage

```bash
# Complete setup (creates wallet, installs dependencies)
./setup.sh

# Create GRC-20 space (one-time setup)
bun run create-space

# Create and publish the complete knowledge graph
bun run publish

# Test individual components
bun run dev                    # Test entity creation
bun run test-simple-entity.ts  # Test simple entity
bun run final-simple-version.ts # Test final version
```

## =� File Structure

```
knowledge-graph/
   export/                      # CSV data files
      markets.csv             # Core market data
      marketplaces.csv        # Marketplace platform data
      external_markets.csv    # External market instances
   create-entities.ts          # Entity creation logic
   publish-entities.ts         # Publishing logic
   export_supabase_data.py    # Data export script
   publication-records.json    # Publication history
   README.md                   # This file
```

## <� Architecture

### Entity Creation Flow

1. **Property Definition** - Create typed properties for each entity
2. **Type Definition** - Define entity types with their properties
3. **Entity Creation** - Create entity instances with data
4. **Relation Creation** - Link entities with semantic relationships

### Publishing Flow

1. **Operation Generation** - Convert entities to GRC-20 operations
2. **IPFS Upload** - Publish operations to IPFS
3. **Transaction Creation** - Generate onchain transaction data
4. **Blockchain Transaction** - Submit to The Graph's network
5. **Indexing** - Wait for data to be indexed and queryable

## = Relationships Defined

```typescript
// Market has many External Markets
Market --[hasExternalMarket]--> ExternalMarket

// External Market belongs to one Market  
ExternalMarket --[parentOf]--> Market

// External Market is hosted on one Marketplace
ExternalMarket --[hostedOnMarketplace]--> Marketplace
```

## =� Data Sources

The knowledge graph is built from three CSV files exported from the PolyBets database:

- **markets.csv**: 34 unique betting markets
- **marketplaces.csv**: 5 marketplace platforms  
- **external_markets.csv**: 100+ external market instances

## < Networks

### Testnet (Development)
- **API**: `https://hypergraph-v2-testnet.up.railway.app`
- **Faucet**: `https://faucet.conduit.xyz/geo-test-zc16z3tcvf`
- **Cost**: Free with testnet ETH

### Mainnet (Production)
- **API**: `https://hypergraph-v2.up.railway.app`
- **Cost**: Real ETH for gas fees
- **Permanence**: Data stored permanently

## = Querying the Graph

Once published, you can query the knowledge graph using The Graph's query interface:

```graphql
query GetMarkets {
  markets {
    id
    commonQuestion
    options
    externalMarkets {
      id
      question
      marketplace {
        name
        chainName
      }
    }
  }
}
```

## =� Development

### Adding New Data

1. Update CSV files in `export/` directory
2. Modify entity creation functions in `create-entities.ts`
3. Run publishing script to update the graph

### Custom Properties

Add new properties by following the pattern:

```typescript
const { id: newPropertyId, ops: newPropertyOps } = Graph.createProperty({
  type: 'TEXT', // or NUMBER, CHECKBOX, etc.
  name: 'Property Name'
});
ops.push(...newPropertyOps);
```

## =� Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GRC20_SPACE_ID` | Yes | The Graph space identifier |
| `PRIVATE_KEY` | Yes | Wallet private key for transactions |
| `NETWORK` | No | `TESTNET` or `MAINNET` (default: TESTNET) |
| `USE_SMART_ACCOUNT` | No | Use smart account for gas sponsorship |
| `EDITOR_ADDRESS` | No | Editor address if different from wallet |

## =� Security Notes

- Never commit private keys to version control
- Use environment variables or secure key management
- Test on testnet before mainnet deployment
- Monitor gas costs for mainnet transactions

## =� Resources

- [GRC-20 Documentation](https://github.com/graphprotocol/grc-20-ts)
- [The Graph Protocol](https://thegraph.com/)
- [Geo Browser](https://www.geobrowser.io/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## > Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on testnet
5. Submit a pull request

## =� License

This project is part of the PolyBets monorepo and follows the same licensing terms.

---

## 🎯 **Current Status**

✅ **DEPLOYED AND OPERATIONAL**

- **Live Knowledge Graph**: Successfully published 18 entities to The Graph testnet
- **Data Coverage**: 6 markets, 5 marketplaces, 6 external market instances, 1 summary
- **Infrastructure**: Complete setup and publishing pipeline operational
- **Documentation**: Comprehensive README and deployment records maintained
- **Testing**: Comprehensive test suite confirms space accessibility and entity deployment
- **Next Steps**: Ready for mainnet deployment or data expansion

### 📈 **Quick Stats**
- **Total Entities**: 18
- **Publication Date**: July 6, 2025 05:32 UTC
- **Network**: The Graph Testnet
- **Status**: ✅ Live and Deployed (indexing in progress)

### 🔗 **Quick Links**
- **View on IPFS**: [ipfs://bafkreihjshcs5eptkqurji33wafkmyzxqqqkzbl7t6yhng42vnhnutfxwe](https://ipfs.io/ipfs/bafkreihjshcs5eptkqurji33wafkmyzxqqqkzbl7t6yhng42vnhnutfxwe)
- **Transaction**: [View on Explorer](https://geo-test.explorer.caldera.xyz/tx/0x8ceb2d010af862fdb084b6e3da0febc5025d096c10657da9cb1a1b2dc735c08a)
- **Space**: [View Space](https://hypergraph-v2-testnet.up.railway.app/space/0e99e2a7-16e2-40a1-a751-8d45b02b9789)

### 🧪 **Testing Commands**
```bash
# Test deployment status
bun run test-deployment.ts

# Query the knowledge graph
bun run query-knowledge-graph.ts overview
bun run query-knowledge-graph.ts entities
bun run query-knowledge-graph.ts search "Trump"
bun run query-knowledge-graph.ts export-all
```
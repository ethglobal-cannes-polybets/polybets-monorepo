import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';

// Load environment variables
config();

async function createPolybetsFinalVersion() {
  try {
    console.log('🚀 Creating PolyBets Knowledge Graph (Final Simple Version)...');
    
    const ops: any[] = [];

    // Create entities using only basic information without relations
    // This should work based on our minimal test

    // === CORE MARKETS ===
    console.log('📊 Creating core markets...');
    
    const { id: trumpNobelId, ops: trumpNobelOps } = Graph.createEntity({
      name: 'Trump Nobel Prize Market',
      description: 'Prediction market: Will Donald Trump win Nobel Peace Prize in 2025? This is one of the most popular political prediction markets on PolyBets.'
    });
    ops.push(...trumpNobelOps);

    const { id: jayzDivorceId, ops: jayzDivorceOps } = Graph.createEntity({
      name: 'Jay-Z Beyoncé Divorce Market',
      description: 'Celebrity prediction market: Will Jay-Z & Beyoncé divorce in 2025? A high-interest entertainment betting market.'
    });
    ops.push(...jayzDivorceOps);

    const { id: birdFluId, ops: birdFluOps } = Graph.createEntity({
      name: 'Bird Flu Vaccine Market',
      description: 'Health prediction market: Will there be a bird flu vaccine approved in 2025? Important public health betting market.'
    });
    ops.push(...birdFluOps);

    const { id: ethereumId, ops: ethereumOps } = Graph.createEntity({
      name: 'Ethereum $4K Market',
      description: 'Cryptocurrency prediction market: Will Ethereum hit $4,000 by December 31, 2025? Popular crypto price prediction.'
    });
    ops.push(...ethereumOps);

    const { id: bitcoinReserveId, ops: bitcoinReserveOps } = Graph.createEntity({
      name: 'US Bitcoin Reserve Market',
      description: 'Financial policy market: Will the US establish a national Bitcoin reserve in 2025? Government crypto adoption prediction.'
    });
    ops.push(...bitcoinReserveOps);

    const { id: goldPriceId, ops: goldPriceOps } = Graph.createEntity({
      name: 'Gold Price $3200+ Market',
      description: 'Commodity market: Will Gold close at $3,200 or more at the end of 2025? Precious metals price prediction.'
    });
    ops.push(...goldPriceOps);

    // === BETTING MARKETPLACES ===
    console.log('🏬 Creating marketplace platforms...');

    const { id: polyMarketId, ops: polyMarketOps } = Graph.createEntity({
      name: 'PolyMarket',
      description: 'Major prediction market platform on Polygon blockchain. Uses orderbook pricing strategy. Currently inactive in our system.'
    });
    ops.push(...polyMarketOps);

    const { id: slaughterhouseId, ops: slaughterhouseOps } = Graph.createEntity({
      name: 'Slaughterhouse Predictions',
      description: 'Active prediction market on Solana Devnet. Uses LMSR pricing mechanism. Known for edgy market descriptions and high engagement.'
    });
    ops.push(...slaughterhouseOps);

    const { id: terminalDegeneracyId, ops: terminalDegeneracyOps } = Graph.createEntity({
      name: 'Terminal Degeneracy Labs',
      description: 'Solana-based prediction marketplace specializing in provocative market questions. Uses LMSR pricing and appeals to degen traders.'
    });
    ops.push(...terminalDegeneracyOps);

    const { id: degenExecutionId, ops: degenExecutionOps } = Graph.createEntity({
      name: 'Degen Execution Chamber',
      description: 'High-stakes prediction market on Solana. Known for extreme market descriptions and risk-taking community. LMSR-based pricing.'
    });
    ops.push(...degenExecutionOps);

    const { id: nihilisticProphetId, ops: nihilisticProphetOps } = Graph.createEntity({
      name: 'Nihilistic Prophet Syndicate',
      description: 'Dark-themed prediction marketplace on Solana. Focuses on contrarian and pessimistic market predictions with LMSR pricing.'
    });
    ops.push(...nihilisticProphetOps);

    // === EXTERNAL MARKET INSTANCES ===
    console.log('🔗 Creating external market instances...');

    const { id: ext1Id, ops: ext1Ops } = Graph.createEntity({
      name: 'Trump Nobel on Slaughterhouse',
      description: 'External market instance: "Will Trump shock the world and snag the Nobel Peace Prize in 2025?" hosted on Slaughterhouse Predictions marketplace.'
    });
    ops.push(...ext1Ops);

    const { id: ext2Id, ops: ext2Ops } = Graph.createEntity({
      name: 'Trump Nobel on Terminal Degeneracy',
      description: 'External market instance: "Will the orange man become a peace dove in 2025?" hosted on Terminal Degeneracy Labs with their signature provocative style.'
    });
    ops.push(...ext2Ops);

    const { id: ext3Id, ops: ext3Ops } = Graph.createEntity({
      name: 'Jay-Z Divorce on Terminal Degeneracy',
      description: 'External market instance: "Will Bey finally say bye to Jay in 2025?" Celebrity divorce prediction on Terminal Degeneracy Labs.'
    });
    ops.push(...ext3Ops);

    const { id: ext4Id, ops: ext4Ops } = Graph.createEntity({
      name: 'Bird Flu Vaccine on Degen Execution',
      description: 'External market instance: "Can big pharma save us from bird flu with an FDA-approved vaccine in 2025?" Health prediction on Degen Execution Chamber.'
    });
    ops.push(...ext4Ops);

    const { id: ext5Id, ops: ext5Ops } = Graph.createEntity({
      name: 'Ethereum $4K on Slaughterhouse',
      description: 'External market instance: "Will Ethereum get slaughtered at $4k before 2026?" Crypto price prediction with Slaughterhouse\'s aggressive branding.'
    });
    ops.push(...ext5Ops);

    const { id: ext6Id, ops: ext6Ops } = Graph.createEntity({
      name: 'Bitcoin Reserve on Terminal Degeneracy',
      description: 'External market instance: "Will the US government become a bitcoin hodler in 2025?" Government crypto policy prediction on Terminal Degeneracy Labs.'
    });
    ops.push(...ext6Ops);

    // === SUMMARY ENTITY ===
    console.log('📋 Creating summary entity...');

    const { id: summaryId, ops: summaryOps } = Graph.createEntity({
      name: 'PolyBets Knowledge Graph Summary',
      description: 'This knowledge graph maps the PolyBets prediction market ecosystem, including 6 core prediction markets, 5 marketplace platforms, and 6 external market instances. Markets cover politics (Trump Nobel Prize), entertainment (Jay-Z divorce), health (bird flu vaccine), cryptocurrency (Ethereum, Bitcoin), and commodities (gold prices). Marketplaces include PolyMarket on Polygon and several Solana-based platforms with different branding strategies and pricing mechanisms.'
    });
    ops.push(...summaryOps);

    console.log('✅ Knowledge graph created successfully!');
    console.log(`📊 Total operations: ${ops.length}`);
    console.log(`🏪 Core markets: 6`);
    console.log(`🏬 Marketplaces: 5`); 
    console.log(`🔗 External markets: 6`);
    console.log(`📋 Summary entities: 1`);
    console.log(`📈 Total entities: 18`);
    
    return ops;
  } catch (error) {
    console.error('❌ Error creating knowledge graph:', error);
    throw error;
  }
}

// Export for use
export { createPolybetsFinalVersion };

// For direct execution
if (require.main === module) {
  createPolybetsFinalVersion();
}
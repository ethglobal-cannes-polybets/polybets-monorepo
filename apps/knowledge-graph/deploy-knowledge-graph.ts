import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load environment variables
config();

async function deployKnowledgeGraph() {
  try {
    console.log('🚀 Deploying PolyBets Knowledge Graph...');
    console.log(`🆔 Space ID: ${process.env.GRC20_SPACE_ID}`);
    console.log(`👤 Editor: ${process.env.EDITOR_ADDRESS}`);
    console.log(`🌐 Network: ${process.env.NETWORK}`);
    
    // Start with a fresh entity operations array
    const operations: any[] = [];
    
    console.log('\n📊 Creating Core Prediction Markets...');
    
    // === CORE PREDICTION MARKETS ===
    const trumpNobel = Graph.createEntity({
      name: 'Trump Nobel Prize Market',
      description: 'Prediction market: Will Donald Trump win the Nobel Peace Prize in 2025? This market covers one of the most discussed political predictions, with high engagement across multiple platforms.'
    });
    operations.push(...trumpNobel.ops);
    console.log(`✅ Created: Trump Nobel Prize Market (${trumpNobel.id})`);
    
    const jayzDivorce = Graph.createEntity({
      name: 'Jay-Z Beyoncé Divorce Market',
      description: 'Celebrity prediction market: Will Jay-Z and Beyoncé divorce in 2025? High-interest entertainment betting market covering celebrity relationships.'
    });
    operations.push(...jayzDivorce.ops);
    console.log(`✅ Created: Jay-Z Beyoncé Divorce Market (${jayzDivorce.id})`);
    
    const birdFlu = Graph.createEntity({
      name: 'Bird Flu Vaccine Market',
      description: 'Health prediction market: Will there be an FDA-approved bird flu vaccine in 2025? Important public health prediction market.'
    });
    operations.push(...birdFlu.ops);
    console.log(`✅ Created: Bird Flu Vaccine Market (${birdFlu.id})`);
    
    const ethereum4k = Graph.createEntity({
      name: 'Ethereum $4K Market',
      description: 'Cryptocurrency prediction market: Will Ethereum reach $4,000 by December 31, 2025? Popular crypto price prediction among traders.'
    });
    operations.push(...ethereum4k.ops);
    console.log(`✅ Created: Ethereum $4K Market (${ethereum4k.id})`);
    
    const bitcoinReserve = Graph.createEntity({
      name: 'US Bitcoin Reserve Market',
      description: 'Financial policy market: Will the United States establish a national Bitcoin reserve in 2025? Government cryptocurrency adoption prediction.'
    });
    operations.push(...bitcoinReserve.ops);
    console.log(`✅ Created: US Bitcoin Reserve Market (${bitcoinReserve.id})`);
    
    const gold3200 = Graph.createEntity({
      name: 'Gold $3200+ Market',
      description: 'Commodity market: Will gold close at $3,200 or higher at the end of 2025? Precious metals price prediction for economic hedging.'
    });
    operations.push(...gold3200.ops);
    console.log(`✅ Created: Gold $3200+ Market (${gold3200.id})`);
    
    console.log('\n🏬 Creating Marketplace Platforms...');
    
    // === MARKETPLACE PLATFORMS ===
    const polymarket = Graph.createEntity({
      name: 'PolyMarket',
      description: 'Major prediction market platform on Polygon blockchain. Uses orderbook pricing strategy and offers a wide range of political, financial, and cultural prediction markets.'
    });
    operations.push(...polymarket.ops);
    console.log(`✅ Created: PolyMarket (${polymarket.id})`);
    
    const slaughterhouse = Graph.createEntity({
      name: 'Slaughterhouse Predictions',
      description: 'Active prediction market on Solana Devnet. Uses LMSR pricing mechanism and is known for provocative market descriptions with high trader engagement.'
    });
    operations.push(...slaughterhouse.ops);
    console.log(`✅ Created: Slaughterhouse Predictions (${slaughterhouse.id})`);
    
    const terminalDegen = Graph.createEntity({
      name: 'Terminal Degeneracy Labs',
      description: 'Solana-based prediction marketplace specializing in contrarian market questions. Uses LMSR pricing and appeals to risk-taking degen trader communities.'
    });
    operations.push(...terminalDegen.ops);
    console.log(`✅ Created: Terminal Degeneracy Labs (${terminalDegen.id})`);
    
    const degenExecution = Graph.createEntity({
      name: 'Degen Execution Chamber',
      description: 'High-stakes prediction market on Solana. Known for extreme market descriptions and attracts a risk-taking community. Uses LMSR-based pricing.'
    });
    operations.push(...degenExecution.ops);
    console.log(`✅ Created: Degen Execution Chamber (${degenExecution.id})`);
    
    const nihilisticProphet = Graph.createEntity({
      name: 'Nihilistic Prophet Syndicate',
      description: 'Dark-themed prediction marketplace on Solana. Focuses on contrarian and pessimistic market predictions with LMSR pricing mechanism.'
    });
    operations.push(...nihilisticProphet.ops);
    console.log(`✅ Created: Nihilistic Prophet Syndicate (${nihilisticProphet.id})`);
    
    console.log('\n🔗 Creating External Market Instances...');
    
    // === EXTERNAL MARKET INSTANCES ===
    const trumpSlaughter = Graph.createEntity({
      name: 'Trump Nobel on Slaughterhouse',
      description: 'External market instance: "Will Trump shock the world and snag the Nobel Peace Prize in 2025?" hosted on Slaughterhouse Predictions with their signature provocative style.'
    });
    operations.push(...trumpSlaughter.ops);
    console.log(`✅ Created: Trump Nobel on Slaughterhouse (${trumpSlaughter.id})`);
    
    const trumpTerminal = Graph.createEntity({
      name: 'Trump Nobel on Terminal Degeneracy',
      description: 'External market instance: "Will the orange man become a peace dove in 2025?" hosted on Terminal Degeneracy Labs with their characteristic irreverent branding.'
    });
    operations.push(...trumpTerminal.ops);
    console.log(`✅ Created: Trump Nobel on Terminal Degeneracy (${trumpTerminal.id})`);
    
    const jayzTerminal = Graph.createEntity({
      name: 'Jay-Z Divorce on Terminal Degeneracy',
      description: 'External market instance: "Will Bey finally say bye to Jay in 2025?" Celebrity divorce prediction on Terminal Degeneracy Labs platform.'
    });
    operations.push(...jayzTerminal.ops);
    console.log(`✅ Created: Jay-Z Divorce on Terminal Degeneracy (${jayzTerminal.id})`);
    
    const birdFluDegen = Graph.createEntity({
      name: 'Bird Flu Vaccine on Degen Execution',
      description: 'External market instance: "Can big pharma save us from bird flu with an FDA-approved vaccine in 2025?" Health prediction on Degen Execution Chamber.'
    });
    operations.push(...birdFluDegen.ops);
    console.log(`✅ Created: Bird Flu Vaccine on Degen Execution (${birdFluDegen.id})`);
    
    const ethSlaughter = Graph.createEntity({
      name: 'Ethereum $4K on Slaughterhouse',
      description: 'External market instance: "Will Ethereum get slaughtered at $4k before 2026?" Crypto price prediction with Slaughterhouse aggressive branding style.'
    });
    operations.push(...ethSlaughter.ops);
    console.log(`✅ Created: Ethereum $4K on Slaughterhouse (${ethSlaughter.id})`);
    
    const btcTerminal = Graph.createEntity({
      name: 'Bitcoin Reserve on Terminal Degeneracy',
      description: 'External market instance: "Will the US government become a bitcoin hodler in 2025?" Government crypto policy prediction on Terminal Degeneracy Labs.'
    });
    operations.push(...btcTerminal.ops);
    console.log(`✅ Created: Bitcoin Reserve on Terminal Degeneracy (${btcTerminal.id})`);
    
    console.log('\n📋 Creating Summary Entity...');
    
    // === SUMMARY ENTITY ===
    const summary = Graph.createEntity({
      name: 'PolyBets Knowledge Graph Summary',
      description: 'This comprehensive knowledge graph maps the PolyBets prediction market ecosystem, documenting 6 core prediction markets (politics, entertainment, health, cryptocurrency, and commodities), 5 diverse marketplace platforms (from mainstream PolyMarket to edgy Solana-based platforms), and 6 external market instances showing how the same predictions appear across different platforms with unique branding and community engagement strategies.'
    });
    operations.push(...summary.ops);
    console.log(`✅ Created: PolyBets Knowledge Graph Summary (${summary.id})`);
    
    console.log('\n📊 Knowledge Graph Statistics:');
    console.log(`🏪 Core Markets: 6`);
    console.log(`🏬 Marketplace Platforms: 5`);
    console.log(`🔗 External Market Instances: 6`);
    console.log(`📋 Summary Entities: 1`);
    console.log(`📈 Total Entities: 18`);
    console.log(`⚙️ Total Operations: ${operations.length}`);
    
    console.log('\n📤 Publishing to The Graph...');
    
    // Use the correct publishing approach from our working method
    const { Ipfs, getWalletClient } = await import('@graphprotocol/grc-20');
    
    // Step 1: Publish to IPFS
    const { cid } = await Ipfs.publishEdit({
      name: 'PolyBets Prediction Markets Knowledge Graph - Complete Ecosystem Mapping',
      ops: operations,
      author: process.env.EDITOR_ADDRESS!,
      network: process.env.NETWORK as 'TESTNET' | 'MAINNET' || 'TESTNET'
    });
    console.log(`✅ Published to IPFS: ${cid}`);
    
    // Step 2: Get transaction calldata
    const apiOrigin = process.env.NETWORK === 'MAINNET' 
      ? 'https://hypergraph-v2.up.railway.app'
      : 'https://hypergraph-v2-testnet.up.railway.app';
      
    const response = await fetch(`${apiOrigin}/space/${process.env.GRC20_SPACE_ID}/edit/calldata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get calldata: ${response.statusText}`);
    }
    
    const { to, data } = await response.json();
    console.log(`✅ Transaction prepared for contract: ${to}`);
    
    // Step 3: Send transaction
    const walletClient = await getWalletClient({
      privateKey: process.env.PRIVATE_KEY!
    });
    
    const txHash = await walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: 0n,
      data: data as `0x${string}`
    });
    
    console.log(`✅ Transaction sent: ${txHash}`);
    console.log(`📄 IPFS CID: ${cid}`);
    console.log(`🔗 Transaction Hash: ${txHash}`);
    
    // Save deployment record
    const deploymentRecord = {
      timestamp: new Date().toISOString(),
      network: process.env.NETWORK || 'TESTNET',
      spaceId: process.env.GRC20_SPACE_ID,
      cid: cid,
      txHash: txHash,
      entitiesCount: 18,
      operationsCount: operations.length,
      entities: {
        coreMarkets: [
          { id: trumpNobel.id, name: 'Trump Nobel Prize Market' },
          { id: jayzDivorce.id, name: 'Jay-Z Beyoncé Divorce Market' },
          { id: birdFlu.id, name: 'Bird Flu Vaccine Market' },
          { id: ethereum4k.id, name: 'Ethereum $4K Market' },
          { id: bitcoinReserve.id, name: 'US Bitcoin Reserve Market' },
          { id: gold3200.id, name: 'Gold $3200+ Market' }
        ],
        marketplaces: [
          { id: polymarket.id, name: 'PolyMarket' },
          { id: slaughterhouse.id, name: 'Slaughterhouse Predictions' },
          { id: terminalDegen.id, name: 'Terminal Degeneracy Labs' },
          { id: degenExecution.id, name: 'Degen Execution Chamber' },
          { id: nihilisticProphet.id, name: 'Nihilistic Prophet Syndicate' }
        ],
        externalMarkets: [
          { id: trumpSlaughter.id, name: 'Trump Nobel on Slaughterhouse' },
          { id: trumpTerminal.id, name: 'Trump Nobel on Terminal Degeneracy' },
          { id: jayzTerminal.id, name: 'Jay-Z Divorce on Terminal Degeneracy' },
          { id: birdFluDegen.id, name: 'Bird Flu Vaccine on Degen Execution' },
          { id: ethSlaughter.id, name: 'Ethereum $4K on Slaughterhouse' },
          { id: btcTerminal.id, name: 'Bitcoin Reserve on Terminal Degeneracy' }
        ],
        summary: [
          { id: summary.id, name: 'PolyBets Knowledge Graph Summary' }
        ]
      }
    };
    
    fs.writeFileSync('deployment-record.json', JSON.stringify(deploymentRecord, null, 2));
    console.log('📝 Deployment record saved to deployment-record.json');
    
    console.log('\n🎉 PolyBets Knowledge Graph deployed successfully!');
    console.log('\n🔍 Test the deployment:');
    console.log('bun run overview');
    console.log('bun run entities');
    console.log('bun run query-knowledge-graph.ts search "Trump"');
    console.log('bun run export');
    
    return deploymentRecord;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Export for use
export { deployKnowledgeGraph };

// For direct execution
if (require.main === module) {
  deployKnowledgeGraph();
}
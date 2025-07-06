import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';

// Load environment variables
config();

async function createPolybetsKnowledgeGraphWorking() {
  try {
    console.log('🚀 Creating PolyBets Knowledge Graph (Working Version)...');
    
    const ops: any[] = [];

    // Create entities using only basic information (name + description)
    // This avoids the property/type definition issues

    // === SAMPLE MARKETS ===
    
    const { id: market1Id, ops: market1Ops } = Graph.createEntity({
      name: 'Trump Nobel Prize Market',
      description: 'Will Donald Trump win Nobel Peace Prize in 2025? Market ID: 59, URL: https://localhost:3001/markets/will-donald-trump-win-nobel-peace-prize-in-2025'
    });
    ops.push(...market1Ops);

    const { id: market2Id, ops: market2Ops } = Graph.createEntity({
      name: 'Jay-Z Beyoncé Divorce Market',
      description: 'Jay-Z & Beyoncé divorce in 2025? Market ID: 60, URL: https://localhost:3001/markets/jayz-beyonc-divorce-in-2025'
    });
    ops.push(...market2Ops);

    const { id: market3Id, ops: market3Ops } = Graph.createEntity({
      name: 'Bird Flu Vaccine Market',
      description: 'Bird flu vaccine in 2025? Market ID: 63, URL: https://localhost:3001/markets/bird-flu-vaccine-in-2025'
    });
    ops.push(...market3Ops);

    const { id: market4Id, ops: market4Ops } = Graph.createEntity({
      name: 'Ethereum 4K Market',
      description: 'Will Ethereum hit $4,000 by December 31? Market ID: 87, URL: https://localhost:3001/markets/will-ethereum-hit-4000-by-december-31'
    });
    ops.push(...market4Ops);

    const { id: market5Id, ops: market5Ops } = Graph.createEntity({
      name: 'US Bitcoin Reserve Market',
      description: 'US national Bitcoin reserve in 2025? Market ID: 68, URL: https://localhost:3001/markets/us-national-bitcoin-reserve-in-2025'
    });
    ops.push(...market5Ops);

    // === MARKETPLACES ===

    const { id: polyMarketId, ops: polyMarketOps } = Graph.createEntity({
      name: 'PolyMarket',
      description: 'Marketplace ID: 1, Chain: Polygon (137), Family: EVM, Strategy: Orderbook, Active: False'
    });
    ops.push(...polyMarketOps);

    const { id: slaughterhouseId, ops: slaughterhouseOps } = Graph.createEntity({
      name: 'Slaughterhouse Predictions',
      description: 'Marketplace ID: 2, Chain: Solana Devnet, Family: Solana, Strategy: LMSR, Address: Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb, Active: True'
    });
    ops.push(...slaughterhouseOps);

    const { id: terminalDegeneracyId, ops: terminalDegeneracyOps } = Graph.createEntity({
      name: 'Terminal Degeneracy Labs',
      description: 'Marketplace ID: 3, Chain: Solana Devnet, Family: Solana, Strategy: LMSR, Address: 9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY, Active: True'
    });
    ops.push(...terminalDegeneracyOps);

    const { id: degenExecutionId, ops: degenExecutionOps } = Graph.createEntity({
      name: 'Degen Execution Chamber',
      description: 'Marketplace ID: 4, Chain: Solana Devnet, Family: Solana, Strategy: LMSR, Address: 4XVwcwETMmcFcV33uBp66gQLd3AJpxd2qz7E2JTn5Jkm, Active: True'
    });
    ops.push(...degenExecutionOps);

    const { id: nihilisticProphetId, ops: nihilisticProphetOps } = Graph.createEntity({
      name: 'Nihilistic Prophet Syndicate',
      description: 'Marketplace ID: 5, Chain: Solana Devnet, Family: Solana, Strategy: LMSR, Address: EWwuoaLcycGPMQWg8Xbyg5x2HVdNWgPF5AwZNRPibeWz, Active: True'
    });
    ops.push(...nihilisticProphetOps);

    // === EXTERNAL MARKETS ===

    const { id: external1Id, ops: external1Ops } = Graph.createEntity({
      name: 'Trump Nobel Prize - Slaughterhouse',
      description: 'External Market ID: 138, Question: Will Trump shock the world and snag the Nobel Peace Prize in 2025? Parent Market: 59, Marketplace: 2 (Slaughterhouse), Method: canibeton-lmsr, URL: https://localhost:3005/slaughterhouse-predictions/getMarketData/will-trump-shock-the-world-and-snag-the-nobel-peace-prize-in-2025'
    });
    ops.push(...external1Ops);

    const { id: external2Id, ops: external2Ops } = Graph.createEntity({
      name: 'Trump Nobel Prize - Terminal Degeneracy',
      description: 'External Market ID: 139, Question: Will the orange man become a peace dove in 2025? Parent Market: 59, Marketplace: 3 (Terminal Degeneracy Labs), Method: canibeton-lmsr, URL: https://localhost:3005/terminal-degeneracy-labs/getMarketData/will-the-orange-man-become-a-peace-dove-in-2025'
    });
    ops.push(...external2Ops);

    const { id: external3Id, ops: external3Ops } = Graph.createEntity({
      name: 'Beyoncé Jay-Z Divorce - Terminal Degeneracy',
      description: 'External Market ID: 141, Question: Will Bey finally say bye to Jay in 2025? Parent Market: 60, Marketplace: 3 (Terminal Degeneracy Labs), Method: canibeton-lmsr, URL: https://localhost:3005/terminal-degeneracy-labs/getMarketData/will-bey-finally-say-bye-to-jay-in-2025'
    });
    ops.push(...external3Ops);

    const { id: external4Id, ops: external4Ops } = Graph.createEntity({
      name: 'Bird Flu Vaccine - Degen Execution',
      description: 'External Market ID: 149, Question: Can big pharma save us from bird flu with an FDA-approved vaccine in 2025? Parent Market: 63, Marketplace: 4 (Degen Execution Chamber), Method: canibeton-lmsr, URL: https://localhost:3005/degen-execution-chamber/getMarketData/can-big-pharma-save-us-from-bird-flu-with-an-fdaapproved-vaccine-in-2025'
    });
    ops.push(...external4Ops);

    const { id: external5Id, ops: external5Ops } = Graph.createEntity({
      name: 'Ethereum 4K - Slaughterhouse',
      description: 'External Market ID: 228, Question: Will Ethereum get slaughtered at $4k before 2026? Parent Market: 87, Marketplace: 2 (Slaughterhouse), Method: canibeton-lmsr, URL: https://localhost:3005/slaughterhouse-predictions/getMarketData/will-ethereum-get-slaughtered-at-4k-before-2026'
    });
    ops.push(...external5Ops);

    // Create some basic relations using the relation creation method
    // Connect external markets to their parent markets and marketplaces

    const { ops: relation1Ops } = Graph.createRelation({
      fromEntity: external1Id,
      toEntity: market1Id,
      property: 'parent-market-relation' // Using a simple string identifier
    });
    ops.push(...relation1Ops);

    const { ops: relation2Ops } = Graph.createRelation({
      fromEntity: external1Id,
      toEntity: slaughterhouseId,
      property: 'hosted-on-marketplace-relation'
    });
    ops.push(...relation2Ops);

    const { ops: relation3Ops } = Graph.createRelation({
      fromEntity: external2Id,
      toEntity: market1Id,
      property: 'parent-market-relation'
    });
    ops.push(...relation3Ops);

    const { ops: relation4Ops } = Graph.createRelation({
      fromEntity: external2Id,
      toEntity: terminalDegeneracyId,
      property: 'hosted-on-marketplace-relation'
    });
    ops.push(...relation4Ops);

    console.log('✅ Knowledge graph created successfully!');
    console.log(`📊 Total operations: ${ops.length}`);
    console.log(`🏪 Markets created: 5`);
    console.log(`🏬 Marketplaces created: 5`);
    console.log(`🔗 External markets created: 5`);
    console.log(`🤝 Relations created: 4`);
    
    console.log('\n📋 Entity Summary:');
    console.log(`Market 1 (Trump Nobel): ${market1Id}`);
    console.log(`Market 2 (Jay-Z Divorce): ${market2Id}`);
    console.log(`Marketplace 1 (Slaughterhouse): ${slaughterhouseId}`);
    console.log(`External Market 1: ${external1Id}`);
    
    return ops;
  } catch (error) {
    console.error('❌ Error creating knowledge graph:', error);
    throw error;
  }
}

// Export for use
export { createPolybetsKnowledgeGraphWorking };

// For direct execution
if (require.main === module) {
  createPolybetsKnowledgeGraphWorking();
}
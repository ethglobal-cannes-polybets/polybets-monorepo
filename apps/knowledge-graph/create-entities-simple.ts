import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';

// Load environment variables
config();

// Initialize operations array
const ops: any[] = [];

async function createPolybetsKnowledgeGraph() {
  try {
    console.log('🚀 Creating PolyBets Knowledge Graph...');
    
    // === CREATE BASIC PROPERTIES ===
    
    // Common properties
    const { id: idPropertyId, ops: idPropertyOps } = Graph.createProperty({
      type: 'NUMBER',
      name: 'ID'
    });
    ops.push(...idPropertyOps);

    const { id: namePropertyId, ops: namePropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'Name'
    });
    ops.push(...namePropertyOps);

    const { id: questionPropertyId, ops: questionPropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'Question'
    });
    ops.push(...questionPropertyOps);

    const { id: urlPropertyId, ops: urlPropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'URL'
    });
    ops.push(...urlPropertyOps);

    const { id: chainNamePropertyId, ops: chainNamePropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'Chain Name'
    });
    ops.push(...chainNamePropertyOps);

    const { id: isActivePropertyId, ops: isActivePropertyOps } = Graph.createProperty({
      type: 'CHECKBOX',
      name: 'Is Active'
    });
    ops.push(...isActivePropertyOps);

    // === CREATE ENTITY TYPES ===

    // Market Type
    const { id: marketTypeId, ops: marketTypeOps } = Graph.createType({
      name: 'Market',
      properties: [idPropertyId, questionPropertyId, urlPropertyId]
    });
    ops.push(...marketTypeOps);

    // Marketplace Type
    const { id: marketplaceTypeId, ops: marketplaceTypeOps } = Graph.createType({
      name: 'Marketplace',
      properties: [idPropertyId, namePropertyId, chainNamePropertyId, isActivePropertyId]
    });
    ops.push(...marketplaceTypeOps);

    // External Market Type
    const { id: externalMarketTypeId, ops: externalMarketTypeOps } = Graph.createType({
      name: 'ExternalMarket',
      properties: [idPropertyId, questionPropertyId, urlPropertyId]
    });
    ops.push(...externalMarketTypeOps);

    // === CREATE SAMPLE ENTITIES ===

    // Sample Market
    const { id: sampleMarketId, ops: sampleMarketOps } = Graph.createEntity({
      name: 'Trump Nobel Prize Market',
      description: 'Market asking if Donald Trump will win Nobel Peace Prize in 2025',
      types: [marketTypeId],
      values: [
        {
          property: idPropertyId,
          value: Graph.serializeNumber(59)
        },
        {
          property: questionPropertyId,
          value: 'Will Donald Trump win Nobel Peace Prize in 2025?'
        },
        {
          property: urlPropertyId,
          value: 'https://localhost:3001/markets/will-donald-trump-win-nobel-peace-prize-in-2025'
        }
      ]
    });
    ops.push(...sampleMarketOps);

    // Sample Marketplace
    const { id: sampleMarketplaceId, ops: sampleMarketplaceOps } = Graph.createEntity({
      name: 'Slaughterhouse Predictions',
      description: 'A betting marketplace on Solana devnet',
      types: [marketplaceTypeId],
      values: [
        {
          property: idPropertyId,
          value: Graph.serializeNumber(2)
        },
        {
          property: namePropertyId,
          value: 'Slaughterhouse Predictions'
        },
        {
          property: chainNamePropertyId,
          value: 'solana-devnet'
        },
        {
          property: isActivePropertyId,
          value: Graph.serializeCheckbox(true)
        }
      ]
    });
    ops.push(...sampleMarketplaceOps);

    // Sample External Market
    const { id: sampleExternalMarketId, ops: sampleExternalMarketOps } = Graph.createEntity({
      name: 'Trump Nobel Prize - Slaughterhouse',
      description: 'External market instance on Slaughterhouse Predictions',
      types: [externalMarketTypeId],
      values: [
        {
          property: idPropertyId,
          value: Graph.serializeNumber(138)
        },
        {
          property: questionPropertyId,
          value: 'Will Trump shock the world and snag the Nobel Peace Prize in 2025?'
        },
        {
          property: urlPropertyId,
          value: 'https://localhost:3005/slaughterhouse-predictions/getMarketData/will-trump-shock-the-world-and-snag-the-nobel-peace-prize-in-2025'
        }
      ]
    });
    ops.push(...sampleExternalMarketOps);

    console.log('✅ Knowledge graph created successfully!');
    console.log(`📊 Total operations: ${ops.length}`);
    console.log(`🏪 Sample Market ID: ${sampleMarketId}`);
    console.log(`🏬 Sample Marketplace ID: ${sampleMarketplaceId}`);
    console.log(`🔗 Sample External Market ID: ${sampleExternalMarketId}`);
    
    return ops;
  } catch (error) {
    console.error('❌ Error creating knowledge graph:', error);
    throw error;
  }
}

// Export for use
export { createPolybetsKnowledgeGraph };

// For direct execution
if (require.main === module) {
  createPolybetsKnowledgeGraph();
}
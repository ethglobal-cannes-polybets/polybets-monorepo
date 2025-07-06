import { Graph, Ipfs, getWalletClient, Id } from '@graphprotocol/grc-20';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Create entities for the PolyBets Knowledge Graph
 * Following the correct GRC-20 entity creation pattern
 */
async function createPolybetsEntities() {
  try {
    console.log('🏗️ Creating entities for PolyBets Markets Knowledge Graph...');
    
    const privateKey = process.env.PRIVATE_KEY;
    const spaceId = process.env.GRC20_SPACE_ID;
    
    if (!privateKey || !spaceId) {
      throw new Error('PRIVATE_KEY and GRC20_SPACE_ID environment variables must be set');
    }
    
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`👤 Using editor address: ${account.address}`);
    console.log(`🌐 Space ID: ${spaceId}`);
    
    // Collection to store all operations
    const ops = [];
    
    // Create entity types first
    console.log('📋 Creating entity types...');
    
    // Market Type
    const { id: marketTypeId, ops: marketTypeOps } = Graph.createType({
      name: 'Market',
      description: 'A prediction market in the PolyBets ecosystem'
    });
    ops.push(...marketTypeOps);
    
    // Marketplace Type
    const { id: marketplaceTypeId, ops: marketplaceTypeOps } = Graph.createType({
      name: 'Marketplace',
      description: 'A platform hosting prediction markets'
    });
    ops.push(...marketplaceTypeOps);
    
    // External Market Type
    const { id: externalMarketTypeId, ops: externalMarketTypeOps } = Graph.createType({
      name: 'External Market',
      description: 'External market instances integrated with PolyBets'
    });
    ops.push(...externalMarketTypeOps);
    
    // Create properties
    console.log('🏷️ Creating properties...');
    
    // Name property
    const { id: namePropertyId, ops: namePropertyOps } = Graph.createProperty({
      name: 'Name',
      description: 'The name of the entity'
    });
    ops.push(...namePropertyOps);
    
    // Description property
    const { id: descriptionPropertyId, ops: descriptionPropertyOps } = Graph.createProperty({
      name: 'Description',
      description: 'A description of the entity'
    });
    ops.push(...descriptionPropertyOps);
    
    // Platform property
    const { id: platformPropertyId, ops: platformPropertyOps } = Graph.createProperty({
      name: 'Platform',
      description: 'The platform or marketplace hosting this item'
    });
    ops.push(...platformPropertyOps);
    
    // Status property
    const { id: statusPropertyId, ops: statusPropertyOps } = Graph.createProperty({
      name: 'Status',
      description: 'Current status of the entity'
    });
    ops.push(...statusPropertyOps);
    
    // Category property
    const { id: categoryPropertyId, ops: categoryPropertyOps } = Graph.createProperty({
      name: 'Category',
      description: 'Category or type classification'
    });
    ops.push(...categoryPropertyOps);
    
    // Created At property
    const { id: createdAtPropertyId, ops: createdAtPropertyOps } = Graph.createProperty({
      name: 'Created At',
      description: 'When the entity was created'
    });
    ops.push(...createdAtPropertyOps);
    
    // Create sample entities
    console.log('🎯 Creating sample entities...');
    
    // Sample Marketplace Entity
    const { id: polymarketId, ops: polymarketOps } = Graph.createEntity({
      name: 'Polymarket',
      description: 'A decentralized prediction market platform',
      types: [marketplaceTypeId],
      values: [
        {
          property: platformPropertyId,
          value: 'Polygon'
        },
        {
          property: statusPropertyId,
          value: 'Active'
        },
        {
          property: categoryPropertyId,
          value: 'DeFi Protocol'
        },
        {
          property: createdAtPropertyId,
          value: Graph.serializeDate(new Date('2023-01-01'))
        }
      ]
    });
    ops.push(...polymarketOps);
    
    // Sample Market Entity
    const { id: electionMarketId, ops: electionMarketOps } = Graph.createEntity({
      name: '2024 US Presidential Election',
      description: 'Prediction market for the 2024 US Presidential Election outcome',
      types: [marketTypeId],
      values: [
        {
          property: platformPropertyId,
          value: 'Polymarket'
        },
        {
          property: statusPropertyId,
          value: 'Active'
        },
        {
          property: categoryPropertyId,
          value: 'Politics'
        },
        {
          property: createdAtPropertyId,
          value: Graph.serializeDate(new Date('2023-06-01'))
        }
      ],
      relations: {
        [platformPropertyId]: {
          toEntity: polymarketId
        }
      }
    });
    ops.push(...electionMarketOps);
    
    // Sample External Market Entity
    const { id: metamaskMarketId, ops: metamaskMarketOps } = Graph.createEntity({
      name: 'MetaMask Integration Market',
      description: 'External market integrated through PolyBets MetaMask connector',
      types: [externalMarketTypeId],
      values: [
        {
          property: platformPropertyId,
          value: 'External API'
        },
        {
          property: statusPropertyId,
          value: 'Connected'
        },
        {
          property: categoryPropertyId,
          value: 'Integration'
        },
        {
          property: createdAtPropertyId,
          value: Graph.serializeDate(new Date())
        }
      ]
    });
    ops.push(...metamaskMarketOps);
    
    console.log(`📊 Created ${ops.length} operations total`);
    console.log('📡 Publishing to IPFS...');
    
    // Publish to IPFS
    const { cid } = await Ipfs.publishEdit({
      name: 'Create PolyBets Knowledge Graph Entities',
      ops: ops,
      author: account.address
    });
    
    console.log(`✅ Published to IPFS: ${cid}`);
    console.log('📤 Submitting to space...');
    
    // Get transaction calldata for the space
    const API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
    const response = await fetch(`${API_ORIGIN}/space/${spaceId}/edit/calldata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get calldata: ${response.status} ${response.statusText}`);
    }
    
    const { to, data } = await response.json();
    
    console.log(`📋 Transaction target: ${to}`);
    console.log(`📝 Transaction data length: ${data.length}`);
    
    // Get wallet client and send transaction
    const walletClient = await getWalletClient({ privateKey });
    
    const txResult = await walletClient.sendTransaction({
      to: to,
      value: 0n,
      data: data
    });
    
    console.log(`🔗 Transaction hash: ${txResult}`);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for transaction confirmation (optional)
    // const receipt = await publicClient.waitForTransactionReceipt({ hash: txResult });
    
    console.log('✅ Entities published successfully!');
    console.log('');
    console.log('📊 Created entities:');
    console.log(`   🏪 Marketplace: Polymarket (${polymarketId})`);
    console.log(`   🎯 Market: 2024 US Presidential Election (${electionMarketId})`);
    console.log(`   🔗 External Market: MetaMask Integration (${metamaskMarketId})`);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Wait a few minutes for indexing');
    console.log('   2. Query your knowledge graph:');
    console.log('      bun run query');
    
    return {
      cid,
      txResult,
      entities: {
        polymarket: polymarketId,
        electionMarket: electionMarketId,
        metamaskMarket: metamaskMarketId
      },
      types: {
        market: marketTypeId,
        marketplace: marketplaceTypeId,
        externalMarket: externalMarketTypeId
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating entities:', error);
    throw error;
  }
}

// Export for use as module
export { createPolybetsEntities };

// For direct execution
if (require.main === module) {
  createPolybetsEntities()
    .then(result => {
      console.log('');
      console.log('🎉 Entity creation completed successfully!');
      console.log(`📋 IPFS CID: ${result.cid}`);
      console.log(`🔗 Transaction: ${result.txResult}`);
    })
    .catch(error => {
      console.error('');
      console.error('❌ Entity creation failed:', error.message);
      process.exit(1);
    });
}
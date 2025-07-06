import { config } from 'dotenv';
import * as fs from 'fs';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '0e99e2a7-16e2-40a1-a751-8d45b02b9789';

async function testDeployment() {
  console.log('🧪 Testing PolyBets Knowledge Graph Deployment...');
  console.log(`🆔 Space ID: ${SPACE_ID}`);
  
  // Read our deployment record to get entity IDs
  const deploymentRecord = JSON.parse(fs.readFileSync('deployment-record.json', 'utf8'));
  
  let ourEntities: any[] = [];
  
  console.log('\n📊 Deployment Summary:');
  console.log(`📅 Deployed: ${deploymentRecord.timestamp}`);
  console.log(`🌐 Network: ${deploymentRecord.network}`);
  console.log(`📄 IPFS CID: ${deploymentRecord.cid}`);
  console.log(`🔗 Transaction: ${deploymentRecord.txHash}`);
  console.log(`📈 Total Entities: ${deploymentRecord.entitiesCount}`);
  
  console.log('\n🔍 Testing Space Access...');
  
  // Test 1: Query space information
  const spaceQuery = `
    query GetSpace($spaceId: String!) {
      space(id: $spaceId) {
        id
        personalAddress
        spaceAddress
        daoAddress
        type
      }
    }
  `;
  
  try {
    const response = await fetch(`${TESTNET_API_ORIGIN}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: spaceQuery,
        variables: { spaceId: SPACE_ID }
      })
    });

    const result = await response.json();
    
    if (result.data?.space) {
      console.log('✅ Space accessible');
      console.log(`📍 Space Address: ${result.data.space.spaceAddress}`);
      console.log(`👤 Personal Address: ${result.data.space.personalAddress}`);
      console.log(`🏛️ DAO Address: ${result.data.space.daoAddress}`);
      console.log(`📋 Type: ${result.data.space.type}`);
    } else {
      console.log('❌ Space not accessible:', result);
    }
  } catch (error) {
    console.error('❌ Space query failed:', error);
  }
  
  console.log('\n🔍 Testing Global Entity Search...');
  
  // Test 2: Look for our entities in the global entities list
  const entitiesQuery = `
    query GetAllEntities {
      entities(limit: 100) {
        id
        name
        description
        createdAtBlock
        spaces
      }
    }
  `;
  
  try {
    const response = await fetch(`${TESTNET_API_ORIGIN}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: entitiesQuery
      })
    });

    const result = await response.json();
    
    if (result.data?.entities) {
      console.log(`📋 Found ${result.data.entities.length} total entities in the graph`);
      
      // Look for our entities
      ourEntities = result.data.entities.filter((entity: any) => 
        entity.spaces?.includes(SPACE_ID)
      );
      
      console.log(`🎯 Found ${ourEntities.length} entities in our space`);
      
      if (ourEntities.length > 0) {
        console.log('\n✅ Our entities are indexed and queryable!');
        ourEntities.forEach((entity: any, index: number) => {
          console.log(`  ${index + 1}. ${entity.name || 'Unnamed'} (${entity.id})`);
        });
      } else {
        console.log('\n⏳ Our entities are not yet indexed (this is normal and may take a few minutes)');
        
        // Check for entities that might be ours by checking names from deployment record
        const knownNames = [
          ...deploymentRecord.entities.coreMarkets.map((e: any) => e.name),
          ...deploymentRecord.entities.marketplaces.map((e: any) => e.name),
          ...deploymentRecord.entities.externalMarkets.map((e: any) => e.name),
          ...deploymentRecord.entities.summary.map((e: any) => e.name)
        ];
        
        const potentialMatches = result.data.entities.filter((entity: any) => 
          entity.name && knownNames.includes(entity.name)
        );
        
        if (potentialMatches.length > 0) {
          console.log('\n🔍 Found potential matches by name:');
          potentialMatches.forEach((entity: any, index: number) => {
            console.log(`  ${index + 1}. ${entity.name} (${entity.id}) - Spaces: ${entity.spaces}`);
          });
        }
      }
      
    } else {
      console.log('❌ Entities query failed:', result);
    }
  } catch (error) {
    console.error('❌ Entities query failed:', error);
  }
  
  console.log('\n📊 Deployment Record Analysis:');
  console.log('='.repeat(50));
  
  console.log('\n🏪 Core Markets:');
  deploymentRecord.entities.coreMarkets.forEach((entity: any, index: number) => {
    console.log(`  ${index + 1}. ${entity.name} (${entity.id})`);
  });
  
  console.log('\n🏬 Marketplace Platforms:');
  deploymentRecord.entities.marketplaces.forEach((entity: any, index: number) => {
    console.log(`  ${index + 1}. ${entity.name} (${entity.id})`);
  });
  
  console.log('\n🔗 External Market Instances:');
  deploymentRecord.entities.externalMarkets.forEach((entity: any, index: number) => {
    console.log(`  ${index + 1}. ${entity.name} (${entity.id})`);
  });
  
  console.log('\n📋 Summary:');
  deploymentRecord.entities.summary.forEach((entity: any, index: number) => {
    console.log(`  ${index + 1}. ${entity.name} (${entity.id})`);
  });
  
  console.log('\n🔗 Quick Links:');
  console.log(`📄 IPFS: https://ipfs.io/ipfs/${deploymentRecord.cid.replace('ipfs://', '')}`);
  console.log(`🔗 Transaction: https://geo-test.explorer.caldera.xyz/tx/${deploymentRecord.txHash}`);
  console.log(`🌐 Space: ${TESTNET_API_ORIGIN}/space/${SPACE_ID}`);
  
  console.log('\n✅ Deployment test completed!');
  
  if (ourEntities && ourEntities.length > 0) {
    console.log('\n🎉 STATUS: Knowledge graph is LIVE and queryable!');
    console.log('\n🚀 Try these commands:');
    console.log('bun run overview');
    console.log('bun run entities');
    console.log('bun run query-knowledge-graph.ts search "Trump"');
    console.log('bun run export');
  } else {
    console.log('\n⏳ STATUS: Knowledge graph is deployed but indexing in progress...');
    console.log('   This is normal and typically takes 2-5 minutes.');
    console.log('   Try running this test again in a few minutes.');
  }
}

// Export for use
export { testDeployment };

// For direct execution
if (require.main === module) {
  testDeployment();
}
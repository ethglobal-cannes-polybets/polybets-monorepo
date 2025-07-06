import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '75c47467-a75b-4408-9c9e-d2b46b970931';

async function debugEntities() {
  console.log('🔍 Debugging entity filtering...');
  console.log(`Space ID: ${SPACE_ID}`);
  
  const query = `
    query GetAllEntities {
      entities(limit: 200) {
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
        query
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log(`✅ Found ${result.data.entities.length} total entities`);
      
      // Find entities with names (likely ours)
      const namedEntities = result.data.entities.filter((e: any) => e.name);
      console.log(`📝 Entities with names: ${namedEntities.length}`);
      
      // Look for our space ID in any entity
      const ourEntities = result.data.entities.filter((e: any) => 
        e.spaces && e.spaces.includes(SPACE_ID)
      );
      console.log(`🏠 Entities in our space: ${ourEntities.length}`);
      
      if (ourEntities.length > 0) {
        console.log('\n🎯 Our entities:');
        ourEntities.forEach((entity: any, index: number) => {
          console.log(`  ${index + 1}. ${entity.name || 'Unnamed'} (${entity.id})`);
          if (entity.description) {
            console.log(`     📄 ${entity.description.substring(0, 80)}...`);
          }
        });
      }
      
      // Look for PolyBets related entities by name
      const polybetsEntities = result.data.entities.filter((e: any) => 
        e.name && (
          e.name.includes('PolyBets') ||
          e.name.includes('Trump') ||
          e.name.includes('Market') ||
          e.name.includes('Prediction')
        )
      );
      console.log(`\n🎲 PolyBets-related entities (by name): ${polybetsEntities.length}`);
      
      if (polybetsEntities.length > 0) {
        console.log('\n🎯 PolyBets entities found:');
        polybetsEntities.forEach((entity: any, index: number) => {
          console.log(`  ${index + 1}. ${entity.name} (${entity.id})`);
          console.log(`     🏠 Spaces: ${entity.spaces}`);
        });
      }
      
    } else {
      console.log('❌ No data returned');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugEntities();
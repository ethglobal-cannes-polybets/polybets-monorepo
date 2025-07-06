import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';

async function findAllEntities() {
  console.log('🔍 Looking for ALL entities with extended search...');
  
  const query = `
    query FindAllEntities {
      entities(limit: 500) {
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
      
      // Find entities with actual names
      const namedEntities = result.data.entities.filter((e: any) => e.name && e.name.trim().length > 0);
      console.log(`📝 Named entities: ${namedEntities.length}`);
      
      // Show all named entities
      console.log('\n📋 All named entities:');
      namedEntities.forEach((entity: any, index: number) => {
        console.log(`${index + 1}. ${entity.name} (Block: ${entity.createdAtBlock}, ID: ${entity.id})`);
        if (entity.description) {
          console.log(`   📄 ${entity.description.substring(0, 80)}...`);
        }
      });
      
      // Check for entities that could be ours by looking for specific patterns
      const possibleOurs = result.data.entities.filter((entity: any) => {
        if (!entity.name) return false;
        const name = entity.name.toLowerCase();
        return name.includes('betting') ||
               name.includes('polybets') ||
               name.includes('knowledge graph') ||
               name.includes('prediction');
      });
      
      console.log(`\n🎯 Possible PolyBets entities: ${possibleOurs.length}`);
      possibleOurs.forEach((entity: any, index: number) => {
        console.log(`${index + 1}. ${entity.name}`);
        console.log(`   🆔 ID: ${entity.id}`);
        console.log(`   🏗️ Block: ${entity.createdAtBlock}`);
        console.log(`   🏠 Spaces: ${entity.spaces?.join(', ') || 'none'}`);
      });
      
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findAllEntities();
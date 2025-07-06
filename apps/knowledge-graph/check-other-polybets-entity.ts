import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const OTHER_POLYBETS_ID = '18a28230-10b3-4f51-a9f4-c36d5a043544';

async function checkOtherPolybetsEntity() {
  console.log('🔍 Checking the other PolyBets entity...');
  console.log(`Entity ID: ${OTHER_POLYBETS_ID}`);
  
  const query = `
    query GetOtherPolybetsEntity($entityId: String!) {
      entity(id: $entityId) {
        id
        name
        description
        createdAtBlock
        spaces
        values {
          value
          property {
            id
          }
        }
        relations {
          id
          to {
            id
            name
            description
          }
        }
        backlinks {
          id
          from {
            id
            name
            description
          }
        }
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
        query,
        variables: { entityId: OTHER_POLYBETS_ID }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Other PolyBets entity:');
      console.log(`📛 Name: ${result.data.entity.name}`);
      console.log(`🏠 Spaces: ${result.data.entity.spaces}`);
      console.log(`🏗️ Created at block: ${result.data.entity.createdAtBlock}`);
      console.log(`🔗 Relations: ${result.data.entity.relations?.length || 0}`);
      console.log(`🔙 Backlinks: ${result.data.entity.backlinks?.length || 0}`);
      
      if (result.data.entity.relations?.length > 0) {
        console.log('\n🔗 Related entities (outgoing):');
        result.data.entity.relations.forEach((rel: any, index: number) => {
          console.log(`  ${index + 1}. ${rel.to.name || 'Unnamed'} (${rel.to.id})`);
          if (rel.to.description) {
            console.log(`     📄 ${rel.to.description.substring(0, 80)}...`);
          }
        });
      }
      
      if (result.data.entity.backlinks?.length > 0) {
        console.log('\n🔙 Related entities (incoming):');
        result.data.entity.backlinks.forEach((link: any, index: number) => {
          console.log(`  ${index + 1}. ${link.from.name || 'Unnamed'} (${link.from.id})`);
          if (link.from.description) {
            console.log(`     📄 ${link.from.description.substring(0, 80)}...`);
          }
        });
      }
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOtherPolybetsEntity();
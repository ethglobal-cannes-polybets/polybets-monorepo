import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const MAIN_ENTITY_ID = 'dcc2e2e7-1923-40a8-9273-2497bf7d7a9d';

async function checkEntityRelations() {
  console.log('🔍 Checking relations from our main entity...');
  console.log(`Entity ID: ${MAIN_ENTITY_ID}`);
  
  const query = `
    query GetEntityRelations($entityId: String!) {
      entity(id: $entityId) {
        id
        name
        description
        relations {
          id
          to {
            id
            name
            description
          }
          type {
            id
          }
        }
        backlinks {
          id
          from {
            id
            name
            description
          }
          type {
            id
          }
        }
        values {
          value
          property {
            id
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
        variables: { entityId: MAIN_ENTITY_ID }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Main entity with relations:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.entity.relations?.length > 0) {
        console.log('\n🔗 Related entities (outgoing):');
        result.data.entity.relations.forEach((rel: any, index: number) => {
          console.log(`  ${index + 1}. ${rel.to.name || 'Unnamed'} (${rel.to.id})`);
        });
      }
      
      if (result.data.entity.backlinks?.length > 0) {
        console.log('\n🔙 Related entities (incoming):');
        result.data.entity.backlinks.forEach((link: any, index: number) => {
          console.log(`  ${index + 1}. ${link.from.name || 'Unnamed'} (${link.from.id})`);
        });
      }
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkEntityRelations();
import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const RELATED_SPACE_ID = '362c1dbd-dc64-44bb-a3c4-652f38a642d7';

async function checkRelatedSpace() {
  console.log('🔍 Checking the related Space entity...');
  console.log(`Related Space Entity ID: ${RELATED_SPACE_ID}`);
  
  const query = `
    query GetRelatedSpace($entityId: String!) {
      entity(id: $entityId) {
        id
        name
        description
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
        variables: { entityId: RELATED_SPACE_ID }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Related Space entity:');
      console.log(JSON.stringify(result.data, null, 2));
      
      if (result.data.entity.relations?.length > 0) {
        console.log(`\n🔗 Space has ${result.data.entity.relations.length} outgoing relations:`);
        result.data.entity.relations.forEach((rel: any, index: number) => {
          console.log(`  ${index + 1}. ${rel.to.name || 'Unnamed'} (${rel.to.id})`);
        });
      }
      
      if (result.data.entity.backlinks?.length > 0) {
        console.log(`\n🔙 Space has ${result.data.entity.backlinks.length} incoming relations:`);
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

checkRelatedSpace();
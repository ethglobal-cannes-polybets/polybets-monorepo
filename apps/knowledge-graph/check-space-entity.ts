import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '75c47467-a75b-4408-9c9e-d2b46b970931';

async function checkSpaceEntity() {
  console.log('🔍 Checking what entity is in our space...');
  console.log(`Space ID: ${SPACE_ID}`);
  
  const query = `
    query GetSpaceEntity($spaceId: String!) {
      space(id: $spaceId) {
        id
        entity {
          id
          name
          description
          createdAtBlock
          values {
            value
            property {
              id
            }
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
        variables: { spaceId: SPACE_ID }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Space entity result:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSpaceEntity();
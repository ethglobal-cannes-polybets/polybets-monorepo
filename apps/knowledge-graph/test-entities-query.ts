import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '75c47467-a75b-4408-9c9e-d2b46b970931';

async function testEntitiesQuery() {
  console.log('🔍 Testing different ways to query entities...');
  
  // Test 1: Query all entities directly (using limit instead of first)
  const entitiesQuery = `
    query GetAllEntities {
      entities(limit: 100) {
        id
        name
        description
        createdAtBlock
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
    console.log('✅ Direct entities query result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Direct entities query failed:', error);
  }

  // Test 2: Get single entity from space (fix ID type)
  const singleEntityQuery = `
    query GetSingleEntity($spaceId: String!) {
      space(id: $spaceId) {
        id
        entity {
          id
          name
          description
          createdAtBlock
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
        query: singleEntityQuery,
        variables: { spaceId: SPACE_ID }
      })
    });

    const result = await response.json();
    console.log('✅ Single entity from space result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Single entity from space failed:', error);
  }
}

testEntitiesQuery();
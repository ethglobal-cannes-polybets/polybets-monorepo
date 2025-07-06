import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '75c47467-a75b-4408-9c9e-d2b46b970931';

async function discoverSchema() {
  console.log('🔍 Discovering GraphQL schema...');
  
  // Test basic space query
  const basicQuery = `
    query BasicSpace {
      space(id: "${SPACE_ID}") {
        id
        personalAddress
        spaceAddress
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
        query: basicQuery
      })
    });

    const result = await response.json();
    console.log('✅ Basic space query result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Basic query failed:', error);
  }

  // Test entities query
  const entitiesQuery = `
    query BasicEntities {
      space(id: "${SPACE_ID}") {
        id
        values(first: 10) {
          entity {
            id
            name
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
        query: entitiesQuery
      })
    });

    const result = await response.json();
    console.log('✅ Entities query result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Entities query failed:', error);
  }

  // Test introspection query to understand schema
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          fields {
            name
            type {
              name
              kind
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
        query: introspectionQuery
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Schema introspection successful');
      
      // Find Space type
      const spaceType = result.data.__schema.types.find((type: any) => type.name === 'Space');
      if (spaceType) {
        console.log('\n📊 Space type fields:');
        spaceType.fields?.forEach((field: any) => {
          console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });
      }

      // Find Entity type  
      const entityType = result.data.__schema.types.find((type: any) => type.name === 'Entity');
      if (entityType) {
        console.log('\n👤 Entity type fields:');
        entityType.fields?.forEach((field: any) => {
          console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });
      }

      // Find Property type
      const propertyType = result.data.__schema.types.find((type: any) => type.name === 'Property');
      if (propertyType) {
        console.log('\n🏷️ Property type fields:');
        propertyType.fields?.forEach((field: any) => {
          console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });
      }

      // Find Relation type
      const relationType = result.data.__schema.types.find((type: any) => type.name === 'Relation');
      if (relationType) {
        console.log('\n🔗 Relation type fields:');
        relationType.fields?.forEach((field: any) => {
          console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });
      }

      // Find Value type
      const valueType = result.data.__schema.types.find((type: any) => type.name === 'Value');
      if (valueType) {
        console.log('\n💎 Value type fields:');
        valueType.fields?.forEach((field: any) => {
          console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
        });
      }
    } else {
      console.log('❌ Schema introspection result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Introspection failed:', error);
  }
}

discoverSchema();
import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const OTHER_SPACE_ID = 'd931d74a-6cf9-427c-8c24-d75776cf971f';

async function checkOtherSpace() {
  console.log('🔍 Checking the other space...');
  console.log(`Space ID: ${OTHER_SPACE_ID}`);
  
  const query = `
    query GetOtherSpace($spaceId: String!) {
      space(id: $spaceId) {
        id
        personalAddress
        spaceAddress
        daoAddress
        type
        entity {
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
        variables: { spaceId: OTHER_SPACE_ID }
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log('✅ Other space:');
      console.log(`🆔 Space ID: ${result.data.space.id}`);
      console.log(`👤 Personal Address: ${result.data.space.personalAddress}`);
      console.log(`📍 Space Address: ${result.data.space.spaceAddress}`);
      console.log(`🏛️ DAO Address: ${result.data.space.daoAddress}`);
      console.log(`📋 Type: ${result.data.space.type}`);
      
      const entity = result.data.space.entity;
      if (entity) {
        console.log(`\n📊 Entity in space: ${entity.name}`);
        console.log(`🔗 Relations: ${entity.relations?.length || 0}`);
        console.log(`🔙 Backlinks: ${entity.backlinks?.length || 0}`);
        
        if (entity.relations?.length > 0) {
          console.log('\n🔗 Related entities (outgoing):');
          entity.relations.forEach((rel: any, index: number) => {
            console.log(`  ${index + 1}. ${rel.to.name || 'Unnamed'} (${rel.to.id})`);
            if (rel.to.description) {
              console.log(`     📄 ${rel.to.description.substring(0, 80)}...`);
            }
          });
        }
        
        if (entity.backlinks?.length > 0) {
          console.log('\n🔙 Related entities (incoming):');
          entity.backlinks.forEach((link: any, index: number) => {
            console.log(`  ${index + 1}. ${link.from.name || 'Unnamed'} (${link.from.id})`);
            if (link.from.description) {
              console.log(`     📄 ${link.from.description.substring(0, 80)}...`);
            }
          });
        }
      }
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOtherSpace();
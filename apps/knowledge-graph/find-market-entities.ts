import { config } from 'dotenv';

// Load environment variables
config();

const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';

async function findMarketEntities() {
  console.log('🔍 Looking for our market entities...');
  
  const query = `
    query FindMarketEntities {
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
        query
      })
    });

    const result = await response.json();
    
    if (result.data) {
      console.log(`✅ Found ${result.data.entities.length} total entities`);
      
      // Filter for entities that look like our PolyBets markets
      const keywords = [
        'Trump', 'Nobel', 'Ethereum', 'Bitcoin', 'Market', 'Prediction',
        'PolyMarket', 'Slaughterhouse', 'Terminal', 'Nihilistic', 'Degen'
      ];
      
      const marketEntities = result.data.entities.filter((entity: any) => {
        if (!entity.name) return false;
        return keywords.some(keyword => 
          entity.name.toLowerCase().includes(keyword.toLowerCase())
        );
      });
      
      console.log(`\n🎯 Found ${marketEntities.length} potential market entities:`);
      
      marketEntities.forEach((entity: any, index: number) => {
        console.log(`\n${index + 1}. ${entity.name}`);
        console.log(`   🆔 ID: ${entity.id}`);
        console.log(`   🏗️ Block: ${entity.createdAtBlock}`);
        console.log(`   🏠 Spaces: ${entity.spaces?.join(', ') || 'none'}`);
        if (entity.description) {
          console.log(`   📄 Description: ${entity.description.substring(0, 100)}...`);
        }
      });
      
      // Check for entities created around the same time as our entities (block 57122-57123)
      const recentEntities = result.data.entities.filter((entity: any) => {
        const block = parseInt(entity.createdAtBlock);
        return block >= 57120 && block <= 57130; // Around the time we published
      });
      
      console.log(`\n⏰ Entities created around our deployment time (blocks 57120-57130): ${recentEntities.length}`);
      recentEntities.forEach((entity: any, index: number) => {
        console.log(`${index + 1}. ${entity.name || 'Unnamed'} (Block: ${entity.createdAtBlock}, ID: ${entity.id})`);
      });
      
    } else {
      console.log('❌ Error result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findMarketEntities();
import { PolybetsKnowledgeGraphClient } from '../query-knowledge-graph';

const SPACE_ID = '75c47467-a75b-4408-9c9e-d2b46b970931';

async function runExamples() {
  const client = new PolybetsKnowledgeGraphClient(SPACE_ID, 'TESTNET');

  console.log('🚀 PolyBets Knowledge Graph Query Examples');
  console.log('==========================================\n');

  try {
    // Example 1: Get space overview
    console.log('📊 Example 1: Space Overview');
    console.log('----------------------------');
    await client.printSpaceOverview();

    // Example 2: List entities by category
    console.log('\n📋 Example 2: Entities by Category');
    console.log('----------------------------------');
    await client.printCategorizedEntities();

    // Example 3: Search for Trump-related entities
    console.log('\n🔍 Example 3: Search for "Trump" entities');
    console.log('------------------------------------------');
    const trumpSearch = await client.searchEntities('Trump');
    console.log(`Found ${trumpSearch.space.entities.length} Trump-related entities:`);
    trumpSearch.space.entities.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    // Example 4: Search for Ethereum entities
    console.log('\n🔍 Example 4: Search for "Ethereum" entities');
    console.log('---------------------------------------------');
    const ethSearch = await client.searchEntities('Ethereum');
    console.log(`Found ${ethSearch.space.entities.length} Ethereum-related entities:`);
    ethSearch.space.entities.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
      if (entity.description) {
        console.log(`     📄 ${entity.description.substring(0, 80)}...`);
      }
    });

    // Example 5: Search for Solana marketplaces
    console.log('\n🔍 Example 5: Search for "Solana" entities');
    console.log('-------------------------------------------');
    const solanaSearch = await client.searchEntities('Solana');
    console.log(`Found ${solanaSearch.space.entities.length} Solana-related entities:`);
    solanaSearch.space.entities.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    // Example 6: Export data samples
    console.log('\n💾 Example 6: Export Data');
    console.log('-------------------------');
    const jsonPath = await client.exportToJSON('example-export.json');
    const csvPath = await client.exportToCSV('example-export.csv');
    console.log(`✅ Exported JSON: ${jsonPath}`);
    console.log(`✅ Exported CSV: ${csvPath}`);

    console.log('\n🎉 All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

export { runExamples };
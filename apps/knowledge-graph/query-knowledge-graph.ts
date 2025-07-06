import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

// Configuration
const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const MAINNET_API_ORIGIN = 'https://hypergraph-v2.up.railway.app';
const SPACE_ID = process.env.GRC20_SPACE_ID || '75c47467-a75b-4408-9c9e-d2b46b970931';
const NETWORK = (process.env.NETWORK as 'TESTNET' | 'MAINNET') || 'TESTNET';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface Entity {
  id: string;
  name: string;
  description?: string;
  createdAtBlock?: string;
  updatedAtBlock?: string;
  spaces?: string[];
}

interface Space {
  id: string;
  name?: string;
  personalAddress?: string;
  spaceAddress?: string;
  createdAtBlock?: string;
  entities?: Entity[];
  entitiesCount?: number;
  relationsCount?: number;
  propertiesCount?: number;
  typesCount?: number;
}

class PolybetsKnowledgeGraphClient {
  private apiUrl: string;
  private spaceId: string;

  constructor(spaceId: string, network: 'TESTNET' | 'MAINNET' = 'TESTNET') {
    this.spaceId = spaceId;
    this.apiUrl = network === 'TESTNET' ? TESTNET_API_ORIGIN : MAINNET_API_ORIGIN;
  }

  /**
   * Execute a GraphQL query
   */
  private async executeQuery<T>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: variables || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return result.data;
    } catch (error) {
      console.error('Error executing GraphQL query:', error);
      throw error;
    }
  }

  /**
   * Get complete space overview
   */
  async getSpaceOverview(): Promise<{ space: Space }> {
    const query = `
      query GetSpaceOverview($spaceId: String!) {
        space(id: $spaceId) {
          id
          personalAddress
          spaceAddress
          daoAddress
          type
        }
      }
    `;

    return this.executeQuery(query, { spaceId: this.spaceId });
  }

  /**
   * Get all entities from our PolyBets space using the global entities query
   */
  async getAllEntities(): Promise<{ entities: Entity[] }> {
    // Query all entities and filter for those in our space
    const query = `
      query GetAllEntities {
        entities(limit: 100) {
          id
          name
          description
          createdAtBlock
          updatedAtBlock
          spaces
        }
      }
    `;

    const result = await this.executeQuery<{ entities: Entity[] }>(query);
    
    // Filter entities to only include those from our space
    const filteredEntities = result.entities.filter(entity => 
      entity.spaces?.includes(this.spaceId)
    );
    
    return { entities: filteredEntities };
  }

  /**
   * Get entities by category
   */
  async getEntitiesByCategory(): Promise<{
    coreMarkets: Entity[];
    marketplaces: Entity[];
    externalMarkets: Entity[];
    summary: Entity[];
    totalEntities: number;
  }> {
    const allEntities = await this.getAllEntities();
    const entities = allEntities.entities;

    const coreMarkets = entities.filter(e => 
      e.name && e.name.includes('Market') && !e.name.includes(' on ')
    );

    const marketplaces = entities.filter(e => 
      e.name && [
        'PolyMarket', 'Slaughterhouse', 'Terminal', 'Degen', 'Nihilistic'
      ].some(keyword => e.name!.includes(keyword))
    );

    const externalMarkets = entities.filter(e => 
      e.name && e.name.includes(' on ')
    );

    const summary = entities.filter(e => 
      e.name && e.name.includes('Summary')
    );

    return {
      coreMarkets,
      marketplaces,
      externalMarkets,
      summary,
      totalEntities: entities.length
    };
  }

  /**
   * Search entities by keyword
   */
  async searchEntities(searchTerm: string): Promise<{ entities: Entity[] }> {
    const allEntities = await this.getAllEntities();
    const entities = allEntities.entities;

    const filtered = entities.filter(entity => 
      (entity.name && entity.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entity.description && entity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return { entities: filtered };
  }

  /**
   * Get entity by ID
   */
  async getEntityById(entityId: string): Promise<{ entity: Entity }> {
    const query = `
      query GetEntityById($entityId: ID!) {
        entity(id: $entityId) {
          id
          name
          description
          createdAtBlock
          updatedAtBlock
          values {
            property {
              id
              name
            }
            value
          }
          types {
            id
            name
          }
          relationsFrom {
            id
            property {
              name
            }
            toEntity {
              id
              name
              description
            }
          }
          relationsTo {
            id
            property {
              name
            }
            fromEntity {
              id
              name
              description
            }
          }
        }
      }
    `;

    return this.executeQuery(query, { entityId });
  }

  /**
   * Export data to JSON file
   */
  async exportToJSON(filename?: string): Promise<string> {
    console.log('📊 Fetching complete knowledge graph data...');
    
    const [overview, allEntities, categorized] = await Promise.all([
      this.getSpaceOverview(),
      this.getAllEntities(),
      this.getEntitiesByCategory()
    ]);

    const exportData = {
      metadata: {
        spaceId: this.spaceId,
        network: NETWORK,
        exportedAt: new Date().toISOString(),
        apiUrl: this.apiUrl
      },
      overview: overview.space,
      entities: allEntities.entities || [],
      categorized: {
        coreMarkets: categorized.coreMarkets,
        marketplaces: categorized.marketplaces,
        externalMarkets: categorized.externalMarkets,
        summary: categorized.summary
      },
      statistics: {
        totalEntities: categorized.totalEntities,
        entitiesByCategory: {
          coreMarkets: categorized.coreMarkets.length,
          marketplaces: categorized.marketplaces.length,
          externalMarkets: categorized.externalMarkets.length,
          summary: categorized.summary.length
        }
      }
    };

    const outputFile = filename || `polybets-knowledge-graph-${Date.now()}.json`;
    const outputPath = path.join(__dirname, outputFile);
    
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Data exported to: ${outputPath}`);
    console.log(`📈 Exported ${exportData.entities.length} entities`);
    
    return outputPath;
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(filename?: string): Promise<string> {
    console.log('📊 Fetching data for CSV export...');
    
    const result = await this.getAllEntities();
    const entities = result.entities || [];

    // Prepare CSV data
    const csvData = entities.map(entity => ({
      id: entity.id,
      name: entity.name,
      description: entity.description || '',
      createdAtBlock: entity.createdAtBlock || '',
      entityType: this.categorizeEntity(entity.name),
      relationsCount: (entity.relationsFrom?.length || 0) + (entity.relationsTo?.length || 0),
      valuesCount: entity.values?.length || 0,
      typesCount: entity.types?.length || 0
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row] || '')
        ).join(',')
      )
    ].join('\n');

    const outputFile = filename || `polybets-entities-${Date.now()}.csv`;
    const outputPath = path.join(__dirname, outputFile);
    
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`✅ CSV exported to: ${outputPath}`);
    console.log(`📈 Exported ${csvData.length} entities`);
    
    return outputPath;
  }

  /**
   * Helper function to categorize entities
   */
  private categorizeEntity(name: string): string {
    if (name.includes('Summary')) return 'Summary';
    if (name.includes('Market') && !name.includes(' on ')) return 'Core Market';
    if (name.includes(' on ')) return 'External Market';
    if (['PolyMarket', 'Slaughterhouse', 'Terminal', 'Degen', 'Nihilistic'].some(keyword => name.includes(keyword))) {
      return 'Marketplace';
    }
    return 'Other';
  }

  /**
   * Pretty print space overview
   */
  async printSpaceOverview(): Promise<void> {
    console.log('🔍 Fetching space overview...');
    
    const result = await this.getSpaceOverview();
    const space = result.space;

    console.log('\n📊 PolyBets Knowledge Graph Overview');
    console.log('=====================================');
    console.log(`🆔 Space ID: ${space.id}`);
    console.log(`📍 Space Address: ${space.spaceAddress}`);
    console.log(`👤 Personal Address: ${space.personalAddress}`);
    console.log(`🏛️  DAO Address: ${space.daoAddress}`);
    console.log(`📋 Space Type: ${space.type}`);
  }

  /**
   * Pretty print categorized entities
   */
  async printCategorizedEntities(): Promise<void> {
    console.log('🔍 Fetching categorized entities...');
    
    const categorized = await this.getEntitiesByCategory();

    console.log('\n📊 PolyBets Entities by Category');
    console.log('================================');

    console.log(`\n🏪 Core Markets (${categorized.coreMarkets.length}):`);
    categorized.coreMarkets.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    console.log(`\n🏬 Marketplace Platforms (${categorized.marketplaces.length}):`);
    categorized.marketplaces.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    console.log(`\n🔗 External Market Instances (${categorized.externalMarkets.length}):`);
    categorized.externalMarkets.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    console.log(`\n📋 Summary (${categorized.summary.length}):`);
    categorized.summary.forEach((entity, index) => {
      console.log(`  ${index + 1}. ${entity.name}`);
    });

    console.log(`\n📈 Total: ${categorized.totalEntities} entities`);
  }
}

// CLI Interface
async function main() {
  const client = new PolybetsKnowledgeGraphClient(SPACE_ID, NETWORK);

  const command = process.argv[2];
  const argument = process.argv[3];

  try {
    switch (command) {
      case 'overview':
        await client.printSpaceOverview();
        break;

      case 'entities':
        await client.printCategorizedEntities();
        break;

      case 'search':
        if (!argument) {
          console.error('❌ Please provide a search term: bun run query-knowledge-graph.ts search "Trump"');
          process.exit(1);
        }
        console.log(`🔍 Searching for "${argument}"...`);
        const searchResult = await client.searchEntities(argument);
        console.log(`\n📊 Found ${searchResult.entities.length} entities:`);
        searchResult.entities.forEach((entity, index) => {
          console.log(`  ${index + 1}. ${entity.name}`);
          if (entity.description) {
            console.log(`     ${entity.description.substring(0, 100)}...`);
          }
        });
        break;

      case 'export-json':
        await client.exportToJSON(argument);
        break;

      case 'export-csv':
        await client.exportToCSV(argument);
        break;

      case 'export-all':
        const jsonPath = await client.exportToJSON();
        const csvPath = await client.exportToCSV();
        console.log(`\n✅ Complete export finished:`);
        console.log(`📄 JSON: ${jsonPath}`);
        console.log(`📊 CSV: ${csvPath}`);
        break;

      case 'entity':
        if (!argument) {
          console.error('❌ Please provide an entity ID: bun run query-knowledge-graph.ts entity "entity-id"');
          process.exit(1);
        }
        console.log(`🔍 Fetching entity "${argument}"...`);
        const entityResult = await client.getEntityById(argument);
        console.log(`\n📊 Entity Details:`);
        console.log(`🆔 ID: ${entityResult.entity.id}`);
        console.log(`📝 Name: ${entityResult.entity.name}`);
        console.log(`📄 Description: ${entityResult.entity.description}`);
        console.log(`🔗 Relations: ${entityResult.entity.relations?.length || 0}`);
        console.log(`🔙 Backlinks: ${entityResult.entity.backlinks?.length || 0}`);
        break;

      default:
        console.log(`
🚀 PolyBets Knowledge Graph Query Tool

Usage: bun run query-knowledge-graph.ts <command> [argument]

Commands:
  overview              Show space overview and statistics
  entities              List all entities by category
  search <term>         Search entities by keyword
  entity <id>           Get detailed entity information
  export-json [file]    Export all data to JSON file
  export-csv [file]     Export entities to CSV file
  export-all            Export both JSON and CSV files

Examples:
  bun run query-knowledge-graph.ts overview
  bun run query-knowledge-graph.ts entities
  bun run query-knowledge-graph.ts search "Trump"
  bun run query-knowledge-graph.ts export-json my-data.json
  bun run query-knowledge-graph.ts export-all

Configuration:
  Space ID: ${SPACE_ID}
  Network: ${NETWORK}
  API URL: ${client['apiUrl']}
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Export for use as module
export { PolybetsKnowledgeGraphClient };

// For direct execution
if (require.main === module) {
  main();
}
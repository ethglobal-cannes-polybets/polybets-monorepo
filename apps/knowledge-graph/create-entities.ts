import { Graph } from '@graphprotocol/grc-20';

// Initialize operations array
const ops: any[] = [];

// === CREATE PROPERTY DEFINITIONS ===

// Market properties
const { id: marketIdPropertyId, ops: marketIdPropertyOps } = Graph.createProperty({
  type: 'NUMBER',
  name: 'Market ID'
});
ops.push(...marketIdPropertyOps);

const { id: commonQuestionPropertyId, ops: commonQuestionPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Common Question'
});
ops.push(...commonQuestionPropertyOps);

const { id: optionsPropertyId, ops: optionsPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Options'
});
ops.push(...optionsPropertyOps);

const { id: marketUrlPropertyId, ops: marketUrlPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Market URL'
});
ops.push(...marketUrlPropertyOps);

// Marketplace properties
const { id: marketplaceIdPropertyId, ops: marketplaceIdPropertyOps } = Graph.createProperty({
  type: 'NUMBER',
  name: 'Marketplace ID'
});
ops.push(...marketplaceIdPropertyOps);

const { id: marketplaceNamePropertyId, ops: marketplaceNamePropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Marketplace Name'
});
ops.push(...marketplaceNamePropertyOps);

const { id: chainIdPropertyId, ops: chainIdPropertyOps } = Graph.createProperty({
  type: 'NUMBER',
  name: 'Chain ID'
});
ops.push(...chainIdPropertyOps);

const { id: chainNamePropertyId, ops: chainNamePropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Chain Name'
});
ops.push(...chainNamePropertyOps);

const { id: chainFamilyPropertyId, ops: chainFamilyPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Chain Family'
});
ops.push(...chainFamilyPropertyOps);

const { id: warpRouterIdPropertyId, ops: warpRouterIdPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Warp Router ID'
});
ops.push(...warpRouterIdPropertyOps);

const { id: marketplaceProxyPropertyId, ops: marketplaceProxyPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Marketplace Proxy'
});
ops.push(...marketplaceProxyPropertyOps);

const { id: addressPropertyId, ops: addressPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Address'
});
ops.push(...addressPropertyOps);

const { id: priceStrategyPropertyId, ops: priceStrategyPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Price Strategy'
});
ops.push(...priceStrategyPropertyOps);

const { id: isActivePropertyId, ops: isActivePropertyOps } = Graph.createProperty({
  type: 'CHECKBOX',
  name: 'Is Active'
});
ops.push(...isActivePropertyOps);

// External Market properties
const { id: externalMarketIdPropertyId, ops: externalMarketIdPropertyOps } = Graph.createProperty({
  type: 'NUMBER',
  name: 'External Market ID'
});
ops.push(...externalMarketIdPropertyOps);

const { id: questionPropertyId, ops: questionPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Question'
});
ops.push(...questionPropertyOps);

const { id: priceLookupParamsPropertyId, ops: priceLookupParamsPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Price Lookup Params'
});
ops.push(...priceLookupParamsPropertyOps);

const { id: priceLookupMethodPropertyId, ops: priceLookupMethodPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'Price Lookup Method'
});
ops.push(...priceLookupMethodPropertyOps);

const { id: parentMarketPropertyId, ops: parentMarketPropertyOps } = Graph.createProperty({
  type: 'NUMBER',
  name: 'Parent Market ID'
});
ops.push(...parentMarketPropertyOps);

const { id: externalMarketUrlPropertyId, ops: externalMarketUrlPropertyOps } = Graph.createProperty({
  type: 'TEXT',
  name: 'External Market URL'
});
ops.push(...externalMarketUrlPropertyOps);

// === CREATE RELATION PROPERTIES ===

const { id: hasExternalMarketPropertyId, ops: hasExternalMarketPropertyOps } = Graph.createProperty({
  type: 'RELATION',
  name: 'Has External Market'
});
ops.push(...hasExternalMarketPropertyOps);

const { id: hostedOnMarketplacePropertyId, ops: hostedOnMarketplacePropertyOps } = Graph.createProperty({
  type: 'RELATION',
  name: 'Hosted On Marketplace'
});
ops.push(...hostedOnMarketplacePropertyOps);

const { id: parentOfPropertyId, ops: parentOfPropertyOps } = Graph.createProperty({
  type: 'RELATION',
  name: 'Parent Of'
});
ops.push(...parentOfPropertyOps);

// === CREATE ENTITY TYPES ===

// Market Type
const { id: marketTypeId, ops: marketTypeOps } = Graph.createType({
  name: 'Market',
  description: 'A betting market with a common question and binary options',
  properties: [
    marketIdPropertyId,
    commonQuestionPropertyId,
    optionsPropertyId,
    marketUrlPropertyId
  ]
});
ops.push(...marketTypeOps);

// Marketplace Type
const { id: marketplaceTypeId, ops: marketplaceTypeOps } = Graph.createType({
  name: 'Marketplace',
  description: 'A betting marketplace platform where external markets are hosted',
  properties: [
    marketplaceIdPropertyId,
    marketplaceNamePropertyId,
    chainIdPropertyId,
    chainNamePropertyId,
    chainFamilyPropertyId,
    warpRouterIdPropertyId,
    marketplaceProxyPropertyId,
    addressPropertyId,
    priceStrategyPropertyId,
    isActivePropertyId
  ]
});
ops.push(...marketplaceTypeOps);

// External Market Type
const { id: externalMarketTypeId, ops: externalMarketTypeOps } = Graph.createType({
  name: 'ExternalMarket',
  description: 'External market instances that reference parent markets and are hosted on specific marketplaces',
  properties: [
    externalMarketIdPropertyId,
    questionPropertyId,
    priceLookupParamsPropertyId,
    priceLookupMethodPropertyId,
    parentMarketPropertyId,
    marketplaceIdPropertyId,
    externalMarketUrlPropertyId
  ]
});
ops.push(...externalMarketTypeOps);

// === CREATE ENTITIES FROM CSV DATA ===

// Function to create market entities
async function createMarketEntities() {
  const marketData = [
    { id: 59, common_question: "Will Donald Trump win Nobel Peace Prize in 2025?", options: "['Yes', 'No']", url: "https://localhost:3001/markets/will-donald-trump-win-nobel-peace-prize-in-2025" },
    { id: 60, common_question: "Jay-Z & Beyoncé divorce in 2025?", options: "['Yes', 'No']", url: "https://localhost:3001/markets/jayz-beyonc-divorce-in-2025" },
    { id: 63, common_question: "Bird flu vaccine in 2025?", options: "['Yes', 'No']", url: "https://localhost:3001/markets/bird-flu-vaccine-in-2025" },
    // Add more market data as needed
  ];

  const marketEntities = [];

  for (const market of marketData) {
    const { id: marketEntityId, ops: marketEntityOps } = Graph.createEntity({
      name: `Market ${market.id}`,
      description: market.common_question,
      types: [marketTypeId],
      values: [
        {
          property: marketIdPropertyId,
          value: Graph.serializeNumber(market.id)
        },
        {
          property: commonQuestionPropertyId,
          value: market.common_question
        },
        {
          property: optionsPropertyId,
          value: market.options
        },
        {
          property: marketUrlPropertyId,
          value: market.url
        }
      ]
    });
    
    ops.push(...marketEntityOps);
    marketEntities.push({ id: market.id, entityId: marketEntityId });
  }

  return marketEntities;
}

// Function to create marketplace entities
async function createMarketplaceEntities() {
  const marketplaceData = [
    { id: 1, name: "PolyMarket", chain_id: 137, chain_name: "polygon", chain_family: "evm", warp_router_id: "", marketplace_proxy: "0x0000000000000000000000000000000000000000", address: "varied", price_strategy: "orderbook", active: false },
    { id: 2, name: "Slaughterhouse Predictions", chain_id: null, chain_name: "solana-devnet", chain_family: "solana", warp_router_id: "", marketplace_proxy: "0x0000000000000000000000000000000000000000", address: "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb", price_strategy: "lmsr", active: true },
    { id: 3, name: "Terminal Degeneracy Labs", chain_id: null, chain_name: "solana-devnet", chain_family: "solana", warp_router_id: "", marketplace_proxy: "0x0000000000000000000000000000000000000000", address: "9Mfat3wrfsciFoi4kUTt7xVxvgYJietFTbAoZ1U6sUPY", price_strategy: "lmsr", active: true },
    // Add more marketplace data as needed
  ];

  const marketplaceEntities = [];

  for (const marketplace of marketplaceData) {
    const { id: marketplaceEntityId, ops: marketplaceEntityOps } = Graph.createEntity({
      name: marketplace.name,
      description: `${marketplace.name} marketplace on ${marketplace.chain_name}`,
      types: [marketplaceTypeId],
      values: [
        {
          property: marketplaceIdPropertyId,
          value: Graph.serializeNumber(marketplace.id)
        },
        {
          property: marketplaceNamePropertyId,
          value: marketplace.name
        },
        ...(marketplace.chain_id ? [{
          property: chainIdPropertyId,
          value: Graph.serializeNumber(marketplace.chain_id)
        }] : []),
        {
          property: chainNamePropertyId,
          value: marketplace.chain_name
        },
        {
          property: chainFamilyPropertyId,
          value: marketplace.chain_family
        },
        {
          property: warpRouterIdPropertyId,
          value: marketplace.warp_router_id || ""
        },
        {
          property: marketplaceProxyPropertyId,
          value: marketplace.marketplace_proxy
        },
        {
          property: addressPropertyId,
          value: marketplace.address
        },
        {
          property: priceStrategyPropertyId,
          value: marketplace.price_strategy
        },
        {
          property: isActivePropertyId,
          value: Graph.serializeCheckbox(marketplace.active)
        }
      ]
    });
    
    ops.push(...marketplaceEntityOps);
    marketplaceEntities.push({ id: marketplace.id, entityId: marketplaceEntityId });
  }

  return marketplaceEntities;
}

// Function to create external market entities with relations
async function createExternalMarketEntities(marketEntities: any[], marketplaceEntities: any[]) {
  const externalMarketData = [
    { id: 138, question: "Will Trump shock the world and snag the Nobel Peace Prize in 2025?", price_lookup_params: "{'marketId': 161, 'marketplaceId': 2}", price_lookup_method: "canibeton-lmsr", parent_market: 59, url: "https://localhost:3005/slaughterhouse-predictions/getMarketData/will-trump-shock-the-world-and-snag-the-nobel-peace-prize-in-2025", marketplace_id: 2 },
    { id: 139, question: "Will the orange man become a peace dove in 2025?", price_lookup_params: "{'marketId': 156, 'marketplaceId': 3}", price_lookup_method: "canibeton-lmsr", parent_market: 59, url: "https://localhost:3005/terminal-degeneracy-labs/getMarketData/will-the-orange-man-become-a-peace-dove-in-2025", marketplace_id: 3 },
    // Add more external market data as needed
  ];

  for (const externalMarket of externalMarketData) {
    // Find corresponding parent market and marketplace entities
    const parentMarket = marketEntities.find(m => m.id === externalMarket.parent_market);
    const marketplace = marketplaceEntities.find(m => m.id === externalMarket.marketplace_id);

    if (!parentMarket || !marketplace) {
      console.warn(`Skipping external market ${externalMarket.id}: missing parent market or marketplace`);
      continue;
    }

    const { id: externalMarketEntityId, ops: externalMarketEntityOps } = Graph.createEntity({
      name: `External Market ${externalMarket.id}`,
      description: externalMarket.question,
      types: [externalMarketTypeId],
      values: [
        {
          property: externalMarketIdPropertyId,
          value: Graph.serializeNumber(externalMarket.id)
        },
        {
          property: questionPropertyId,
          value: externalMarket.question
        },
        {
          property: priceLookupParamsPropertyId,
          value: externalMarket.price_lookup_params
        },
        {
          property: priceLookupMethodPropertyId,
          value: externalMarket.price_lookup_method
        },
        {
          property: parentMarketPropertyId,
          value: Graph.serializeNumber(externalMarket.parent_market)
        },
        {
          property: marketplaceIdPropertyId,
          value: Graph.serializeNumber(externalMarket.marketplace_id)
        },
        {
          property: externalMarketUrlPropertyId,
          value: externalMarket.url
        }
      ],
      relations: {
        [parentOfPropertyId]: {
          toEntity: parentMarket.entityId,
          values: []
        },
        [hostedOnMarketplacePropertyId]: {
          toEntity: marketplace.entityId,
          values: []
        }
      }
    });
    
    ops.push(...externalMarketEntityOps);

    // Create reverse relations
    const { ops: parentRelationOps } = Graph.createRelation({
      fromEntity: parentMarket.entityId,
      toEntity: externalMarketEntityId,
      property: hasExternalMarketPropertyId
    });
    ops.push(...parentRelationOps);
  }
}

// Main execution function
async function createKnowledgeGraph() {
  try {
    console.log('Creating market entities...');
    const marketEntities = await createMarketEntities();
    
    console.log('Creating marketplace entities...');
    const marketplaceEntities = await createMarketplaceEntities();
    
    console.log('Creating external market entities with relations...');
    await createExternalMarketEntities(marketEntities, marketplaceEntities);
    
    console.log(`Knowledge graph created successfully!`);
    console.log(`Total operations: ${ops.length}`);
    console.log(`Markets created: ${marketEntities.length}`);
    console.log(`Marketplaces created: ${marketplaceEntities.length}`);
    
    return ops;
  } catch (error) {
    console.error('Error creating knowledge graph:', error);
    throw error;
  }
}

// Export for use
export { createKnowledgeGraph, ops };

// For direct execution
if (require.main === module) {
  createKnowledgeGraph();
}
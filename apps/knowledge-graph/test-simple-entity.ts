import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';

// Load environment variables
config();

async function createSimpleTestEntity() {
  try {
    console.log('🧪 Creating simple test entity...');
    
    const ops: any[] = [];

    // Create a simple text property
    const { id: namePropertyId, ops: namePropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'Name'
    });
    ops.push(...namePropertyOps);

    const { id: descriptionPropertyId, ops: descriptionPropertyOps } = Graph.createProperty({
      type: 'TEXT',
      name: 'Description'
    });
    ops.push(...descriptionPropertyOps);

    // Create a simple type
    const { id: testTypeId, ops: testTypeOps } = Graph.createType({
      name: 'TestEntity',
      properties: [namePropertyId, descriptionPropertyId]
    });
    ops.push(...testTypeOps);

    // Create a simple entity
    const { id: testEntityId, ops: testEntityOps } = Graph.createEntity({
      name: 'Test Entity',
      description: 'A simple test entity',
      types: [testTypeId],
      values: [
        {
          property: namePropertyId,
          value: 'Test Entity'
        },
        {
          property: descriptionPropertyId,
          value: 'A simple test entity for PolyBets'
        }
      ]
    });
    ops.push(...testEntityOps);

    console.log('✅ Test entity created successfully!');
    console.log(`📊 Total operations: ${ops.length}`);
    console.log(`🆔 Entity ID: ${testEntityId}`);
    
    return ops;
  } catch (error) {
    console.error('❌ Error creating test entity:', error);
    throw error;
  }
}

// For direct execution
if (require.main === module) {
  createSimpleTestEntity();
}

export { createSimpleTestEntity };
import { Graph } from '@graphprotocol/grc-20';

console.log('🧪 Testing different property type formats...');

const propertyTypes = [
  'TEXT',
  'text', 
  'NUMBER',
  'number',
  'CHECKBOX',
  'checkbox',
  'TIME',
  'time',
  'POINT', 
  'point',
  'RELATION',
  'relation'
];

for (const type of propertyTypes) {
  try {
    console.log(`\n🔍 Testing type: "${type}"`);
    const result = Graph.createProperty({
      type: type as any,
      name: `Test ${type}`
    });
    
    const operation = result.ops[0] as any;
    console.log(`✅ Success - dataType: ${operation.property.dataType}`);
    
    if (operation.property.dataType !== undefined) {
      console.log(`🎯 FOUND WORKING TYPE: "${type}" -> ${operation.property.dataType}`);
      break;
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

// Also try with different case combinations
console.log('\n🔍 Testing other possible formats...');

const alternatives = [
  { type: 0, name: 'Numeric 0' },
  { type: 1, name: 'Numeric 1' },
  { type: 2, name: 'Numeric 2' },
  { type: 'String', name: 'String type' },
  { type: 'Text', name: 'Text type' },
];

for (const alt of alternatives) {
  try {
    const result = Graph.createProperty(alt as any);
    const operation = result.ops[0] as any;
    console.log(`✅ ${alt.name} - dataType: ${operation.property.dataType}`);
  } catch (error) {
    console.log(`❌ ${alt.name} failed: ${error.message.substring(0, 50)}...`);
  }
}
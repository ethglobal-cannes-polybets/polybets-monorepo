import { Graph } from '@graphprotocol/grc-20';

console.log('🔍 Debugging GRC-20 exports...');
console.log('Graph object:', Object.keys(Graph));

// Try to see what's available
try {
  console.log('Graph.createProperty:', typeof Graph.createProperty);
  console.log('Graph.createType:', typeof Graph.createType);
  console.log('Graph.createEntity:', typeof Graph.createEntity);
  console.log('Graph.serializeNumber:', typeof Graph.serializeNumber);
  console.log('Graph.serializeCheckbox:', typeof Graph.serializeCheckbox);
} catch (error) {
  console.error('Error accessing Graph methods:', error);
}

// Try a very simple property creation
try {
  console.log('🧪 Testing simple property creation...');
  const result = Graph.createProperty({
    type: 'TEXT',
    name: 'Test'
  });
  console.log('✅ Property creation success:', result);
} catch (error) {
  console.error('❌ Property creation failed:', error);
}
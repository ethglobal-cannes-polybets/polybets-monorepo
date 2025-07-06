import * as GRC20 from '@graphprotocol/grc-20';

console.log('🔍 All GRC-20 exports:');
console.log(Object.keys(GRC20));

console.log('\n🔍 Checking for DataType or PropertyType exports:');
const grc20Keys = Object.keys(GRC20);
const typeKeys = grc20Keys.filter(key => 
  key.toLowerCase().includes('type') || 
  key.toLowerCase().includes('data') ||
  key.toLowerCase().includes('enum')
);
console.log('Type-related exports:', typeKeys);

// Check if there are any constants or enums
for (const key of grc20Keys) {
  const value = (GRC20 as any)[key];
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    console.log(`\n🔍 ${key}:`, Object.keys(value));
  }
}
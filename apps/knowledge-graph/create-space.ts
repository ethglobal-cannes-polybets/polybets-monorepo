import { Graph } from '@graphprotocol/grc-20';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

/**
 * Create a new GRC-20 space for PolyBets knowledge graph
 */
async function createPolybetsSpace() {
  try {
    // Make sure you have a wallet address ready
    const editorAddress = process.env.EDITOR_ADDRESS || 'your-wallet-address-here';
    const network = (process.env.NETWORK as 'TESTNET' | 'MAINNET') || 'TESTNET';
    
    if (!editorAddress || editorAddress === 'your-wallet-address-here') {
      throw new Error('EDITOR_ADDRESS environment variable must be set');
    }

    console.log('🚀 Creating PolyBets GRC-20 space...');
    console.log(`📍 Network: ${network}`);
    console.log(`👤 Editor: ${editorAddress}`);

    const spaceResult = await Graph.createSpace({
      editorAddress: editorAddress,
      name: 'PolyBets Betting Markets Knowledge Graph',
      network: network
    });

    // Handle different possible return types
    let spaceId: string;
    if (typeof spaceResult === 'string') {
      spaceId = spaceResult;
    } else if (spaceResult && typeof spaceResult === 'object') {
      // Try common property names
      spaceId = (spaceResult as any).id || (spaceResult as any).spaceId || (spaceResult as any).space_id || JSON.stringify(spaceResult);
    } else {
      spaceId = String(spaceResult);
    }

    console.log('✅ Space created successfully!');
    console.log(`📄 Space ID: ${spaceId}`);

    // Update .env file with the space ID
    await updateEnvWithSpaceId(spaceId);

    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. ✅ Space ID added to .env file automatically');
    console.log('2. Run the publishing script:');
    console.log('   bun run publish');

    return spaceId;
  } catch (error) {
    console.error('❌ Error creating space:', error);
    console.error('Full error:', error);
    throw error;
  }
}

/**
 * Update .env file with the space ID
 */
async function updateEnvWithSpaceId(spaceId: string) {
  try {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
      throw new Error('.env file not found');
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the placeholder space ID
    envContent = envContent.replace(
      /GRC20_SPACE_ID=your-space-id-here-REPLACE-AFTER-CREATING-SPACE/,
      `GRC20_SPACE_ID=${spaceId}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated with Space ID');
  } catch (error) {
    console.error('❌ Error updating .env file:', error);
    console.log('Please manually add this to your .env file:');
    console.log(`GRC20_SPACE_ID=${spaceId}`);
  }
}

// Export for use as module
export { createPolybetsSpace };

// For direct execution
if (require.main === module) {
  createPolybetsSpace();
}
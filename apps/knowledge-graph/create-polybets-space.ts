import { Graph } from '@graphprotocol/grc-20';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

/**
 * Create a new GRC-20 space for PolyBets Knowledge Graph
 * Following the correct GRC-20 space deployment pattern
 */
async function createPolybetsSpace() {
  try {
    console.log('🏗️ Creating PolyBets Markets Knowledge Graph space...');
    
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable not set');
    }
    
    // Create account from private key
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`👤 Using editor address: ${account.address}`);
    console.log(`🌐 Network: TESTNET`);
    
    // Create space with proper parameters
    const spaceResult = await Graph.createSpace({
      editorAddress: account.address,
      name: 'PolyBets Markets Knowledge Graph',
      network: 'TESTNET'
    });
    
    // Extract space ID from result object
    const spaceId = typeof spaceResult === 'string' ? spaceResult : spaceResult.id;
    
    console.log('✅ Space created successfully!');
    console.log(`🆔 Space ID: ${spaceId}`);
    
    // Update .env file with the new space ID
    await updateEnvWithSpaceId(spaceId);
    
    // Save space details for reference
    const spaceRecord = {
      timestamp: new Date().toISOString(),
      spaceId: spaceId,
      spaceResult: spaceResult, // Keep the full result for debugging
      editorAddress: account.address,
      name: 'PolyBets Markets Knowledge Graph',
      description: 'A comprehensive knowledge graph mapping the PolyBets prediction market ecosystem including core markets, marketplace platforms, and external market instances',
      network: 'TESTNET',
      status: 'created'
    };
    
    fs.writeFileSync('polybets-space-info.json', JSON.stringify(spaceRecord, null, 2));
    console.log('📋 Space details saved to polybets-space-info.json');
    
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. ✅ Space ID added to .env file automatically');
    console.log('2. Run the publishing script to add entities:');
    console.log('   bun run publish');
    console.log('3. Query the knowledge graph:');
    console.log('   bun run query');
    
    return spaceId;
    
  } catch (error) {
    console.error('❌ Error creating space:', error);
    
    // Handle specific JSON parse errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('');
      console.error('💡 JSON Parse Error Solution:');
      console.error('This often happens when:');
      console.error('1. Network connectivity issues');
      console.error('2. Invalid API response format');
      console.error('3. Rate limiting from the GRC-20 service');
      console.error('');
      console.error('Try:');
      console.error('- Wait a few minutes and retry');
      console.error('- Check your network connection');
      console.error('- Ensure your private key is valid');
    }
    
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
      console.warn('⚠️  .env file not found, creating new one');
      const envContent = `# PolyBets Knowledge Graph Environment Configuration
GRC20_SPACE_ID=${spaceId}
NETWORK=TESTNET
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ New .env file created with Space ID');
      return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update existing space ID or add new one
    const spaceIdRegex = /GRC20_SPACE_ID=.*/;
    const newSpaceIdLine = `GRC20_SPACE_ID=${spaceId}`;
    
    if (spaceIdRegex.test(envContent)) {
      envContent = envContent.replace(spaceIdRegex, newSpaceIdLine);
    } else {
      envContent += `\n${newSpaceIdLine}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated with Space ID');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error);
    console.log('');
    console.log('Please manually add this to your .env file:');
    console.log(`GRC20_SPACE_ID=${spaceId}`);
  }
}

// Export for use as module
export { createPolybetsSpace };

// For direct execution
if (require.main === module) {
  createPolybetsSpace()
    .then(spaceId => {
      console.log('');
      console.log('🎉 Space creation completed successfully!');
      console.log(`🆔 Your space ID: ${spaceId}`);
    })
    .catch(error => {
      console.error('');
      console.error('❌ Space creation failed:', error.message);
      process.exit(1);
    });
}
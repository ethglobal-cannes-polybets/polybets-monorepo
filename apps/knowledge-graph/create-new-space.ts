import { Graph } from '@graphprotocol/grc-20';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load environment variables
config();

async function createNewSpace() {
  try {
    console.log('🏗️ Creating new GRC-20 space for PolyBets Knowledge Graph...');
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable not set');
    }
    
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`👤 Using account: ${account.address}`);
    
    // Create space
    const result = await Graph.createSpace({
      name: 'PolyBets Markets Knowledge Graph',
      description: 'A comprehensive knowledge graph mapping the PolyBets prediction market ecosystem including core markets, marketplace platforms, and external market instances',
      network: 'TESTNET'
    });
    
    console.log('✅ Space created successfully!');
    console.log(`🆔 Space ID: ${result.spaceId}`);
    console.log(`📍 Space Address: ${result.address}`);
    console.log(`🏛️ DAO Address: ${result.daoAddress}`);
    console.log(`🔗 Transaction Hash: ${result.txHash}`);
    
    // Update .env file with new space ID
    const envPath = '.env';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the GRC20_SPACE_ID
    const newSpaceId = `GRC20_SPACE_ID=${result.spaceId}`;
    
    if (envContent.includes('GRC20_SPACE_ID=')) {
      envContent = envContent.replace(/GRC20_SPACE_ID=.*/g, newSpaceId);
    } else {
      envContent += `\n${newSpaceId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env file with new space ID`);
    
    // Save space details for reference
    const spaceRecord = {
      timestamp: new Date().toISOString(),
      spaceId: result.spaceId,
      address: result.address,
      daoAddress: result.daoAddress,
      txHash: result.txHash,
      name: 'PolyBets Markets Knowledge Graph',
      network: 'TESTNET'
    };
    
    fs.writeFileSync('space-info.json', JSON.stringify(spaceRecord, null, 2));
    console.log('📋 Space details saved to space-info.json');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error creating space:', error);
    throw error;
  }
}

// Export for use
export { createNewSpace };

// For direct execution
if (require.main === module) {
  createNewSpace();
}
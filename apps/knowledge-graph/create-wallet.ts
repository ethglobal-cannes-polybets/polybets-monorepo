import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate a new wallet for GRC-20 operations
 */
function createNewWallet() {
  try {
    console.log('🔐 Generating new wallet...');
    
    // Generate a new private key
    const privateKey = generatePrivateKey();
    
    // Get the account from private key
    const account = privateKeyToAccount(privateKey);
    
    console.log('✅ Wallet created successfully!');
    console.log('');
    console.log('🔑 Wallet Details:');
    console.log(`Address: ${account.address}`);
    console.log(`Private Key: ${privateKey}`);
    console.log('');
    console.log('⚠️  SECURITY WARNING:');
    console.log('- Keep your private key secret and secure');
    console.log('- Never share it with anyone');
    console.log('- Never commit it to version control');
    console.log('- Consider using a hardware wallet for mainnet');
    
    return {
      address: account.address,
      privateKey: privateKey
    };
  } catch (error) {
    console.error('❌ Error creating wallet:', error);
    throw error;
  }
}

/**
 * Create or update .env file with wallet credentials
 */
function updateEnvFile(address: string, privateKey: string) {
  try {
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    console.log('📝 Creating .env file...');
    
    // Read the example file as template
    let envContent = '';
    
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // Replace placeholder values
      envContent = envContent
        .replace('your-space-id-here', 'your-space-id-here-REPLACE-AFTER-CREATING-SPACE')
        .replace('your-private-key-here', privateKey)
        .replace('EDITOR_ADDRESS=0x...', `EDITOR_ADDRESS=${address}`);
    } else {
      // Create minimal .env content if example doesn't exist
      envContent = `# PolyBets Knowledge Graph Environment Configuration

# === REQUIRED ===

# The Graph GRC-20 Space ID (set this after creating your space)
GRC20_SPACE_ID=your-space-id-here-REPLACE-AFTER-CREATING-SPACE

# Private key for wallet transactions
PRIVATE_KEY=${privateKey}

# === OPTIONAL ===

# Network to deploy to
NETWORK=TESTNET

# Use smart account for gas sponsorship (recommended)
USE_SMART_ACCOUNT=true

# Editor address
EDITOR_ADDRESS=${address}
`;
    }
    
    // Write the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    
    return envPath;
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
    throw error;
  }
}

/**
 * Display next steps for the user
 */
function displayNextSteps(address: string) {
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('');
  console.log('1. 💰 Fund your wallet with testnet ETH:');
  console.log('   Visit: https://faucet.conduit.xyz/geo-test-zc16z3tcvf');
  console.log(`   Send testnet ETH to: ${address}`);
  console.log('');
  console.log('2. 🌟 (Optional) Get Geo wallet for sponsored transactions:');
  console.log('   Visit: https://www.geobrowser.io/export-wallet');
  console.log('   Replace PRIVATE_KEY in .env with Geo wallet private key');
  console.log('');
  console.log('3. 🏗️  Create your GRC-20 space:');
  console.log('   npx ts-node create-space.ts');
  console.log('');
  console.log('4. 📊 Publish your knowledge graph:');
  console.log('   npx ts-node publish-entities.ts');
  console.log('');
  console.log('⚠️  Remember: Keep your private key secure!');
}

/**
 * Main function to create wallet and setup environment
 */
async function setupWallet() {
  try {
    const wallet = createNewWallet();
    const envPath = updateEnvFile(wallet.address, wallet.privateKey);
    displayNextSteps(wallet.address);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      envPath: envPath
    };
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { createNewWallet, updateEnvFile, setupWallet };

// For direct execution
if (require.main === module) {
  setupWallet();
}
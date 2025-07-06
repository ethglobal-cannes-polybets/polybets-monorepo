import { Graph, Ipfs, getWalletClient, getSmartAccountWalletClient } from '@graphprotocol/grc-20';
import { createPolybetsFinalVersion } from './final-simple-version';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

// Configuration
const TESTNET_API_ORIGIN = 'https://hypergraph-v2-testnet.up.railway.app';
const MAINNET_API_ORIGIN = 'https://hypergraph-v2.up.railway.app';

interface PublishConfig {
  spaceId: string;
  privateKey: string;
  network: 'TESTNET' | 'MAINNET';
  useSmartAccount?: boolean;
  editorAddress?: string;
}

class PolybetsKnowledgeGraphPublisher {
  private config: PublishConfig;
  private apiOrigin: string;

  constructor(config: PublishConfig) {
    this.config = config;
    this.apiOrigin = config.network === 'TESTNET' ? TESTNET_API_ORIGIN : MAINNET_API_ORIGIN;
  }

  /**
   * Publish the complete knowledge graph for betting markets
   */
  async publishKnowledgeGraph(): Promise<{ cid: string; txHash: string }> {
    try {
      console.log('🚀 Starting knowledge graph publishing process...');
      
      // Step 1: Generate all operations
      console.log('📊 Creating knowledge graph operations...');
      const ops = await createPolybetsFinalVersion();
      console.log(`✅ Generated ${ops.length} operations`);

      // Step 2: Publish to IPFS
      console.log('📤 Publishing to IPFS...');
      const { cid } = await Ipfs.publishEdit({
        name: 'PolyBets Knowledge Graph - Markets, Marketplaces & External Markets',
        ops: ops,
        author: this.config.editorAddress || this.getAddressFromPrivateKey(),
        network: this.config.network
      });
      console.log(`✅ Published to IPFS: ${cid}`);

      // Step 3: Get transaction calldata
      console.log('🔧 Generating transaction calldata...');
      const { to, data } = await this.getTransactionCalldata(cid);
      console.log(`✅ Transaction prepared for contract: ${to}`);

      // Step 4: Send transaction
      console.log('📡 Sending onchain transaction...');
      const txHash = await this.sendTransaction(to, data);
      console.log(`✅ Transaction sent: ${txHash}`);

      // Step 5: Save publication record
      await this.savePublicationRecord(cid, txHash);

      console.log('🎉 Knowledge graph published successfully!');
      return { cid, txHash };

    } catch (error) {
      console.error('❌ Error publishing knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Get transaction calldata from the API
   */
  private async getTransactionCalldata(cid: string): Promise<{ to: string; data: string }> {
    const response = await fetch(`${this.apiOrigin}/space/${this.config.spaceId}/edit/calldata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid })
    });

    if (!response.ok) {
      throw new Error(`Failed to get calldata: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Send transaction using wallet or smart account
   */
  private async sendTransaction(to: string, data: string): Promise<string> {
    if (this.config.useSmartAccount) {
      return this.sendSmartAccountTransaction(to, data);
    } else {
      return this.sendWalletTransaction(to, data);
    }
  }

  /**
   * Send transaction with regular wallet
   */
  private async sendWalletTransaction(to: string, data: string): Promise<string> {
    const walletClient = await getWalletClient({
      privateKey: this.config.privateKey
    });

    const txResult = await walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: 0n,
      data: data as `0x${string}`
    });

    return txResult;
  }

  /**
   * Send transaction with smart account (gas sponsored)
   */
  private async sendSmartAccountTransaction(to: string, data: string): Promise<string> {
    const smartAccountClient = await getSmartAccountWalletClient({
      privateKey: this.config.privateKey
    });

    const txResult = await smartAccountClient.sendTransaction({
      to: to as `0x${string}`,
      value: 0n,
      data: data as `0x${string}`
    });

    return txResult;
  }

  /**
   * Get address from private key for author field
   */
  private getAddressFromPrivateKey(): string {
    // This would normally use viem's privateKeyToAccount
    // For now, return a placeholder that should be replaced with actual implementation
    return this.config.editorAddress || '0x0000000000000000000000000000000000000000';
  }

  /**
   * Save publication record to local file
   */
  private async savePublicationRecord(cid: string, txHash: string): Promise<void> {
    const record = {
      timestamp: new Date().toISOString(),
      network: this.config.network,
      spaceId: this.config.spaceId,
      cid: cid,
      txHash: txHash,
      status: 'published'
    };

    const recordsPath = path.join(__dirname, 'publication-records.json');
    let records = [];

    try {
      if (fs.existsSync(recordsPath)) {
        const existingData = fs.readFileSync(recordsPath, 'utf8');
        records = JSON.parse(existingData);
      }
    } catch (error) {
      console.warn('Could not read existing publication records:', error);
    }

    records.push(record);

    fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2));
    console.log(`📝 Publication record saved to ${recordsPath}`);
  }

  /**
   * Publish incremental updates to the knowledge graph
   */
  async publishUpdate(newOps: any[], updateDescription: string): Promise<{ cid: string; txHash: string }> {
    console.log(`🔄 Publishing update: ${updateDescription}`);
    
    const { cid } = await Ipfs.publishEdit({
      name: `PolyBets Update: ${updateDescription}`,
      ops: newOps,
      author: this.config.editorAddress || this.getAddressFromPrivateKey(),
      network: this.config.network
    });

    const { to, data } = await this.getTransactionCalldata(cid);
    const txHash = await this.sendTransaction(to, data);
    
    await this.savePublicationRecord(cid, txHash);
    
    console.log(`✅ Update published: ${cid}`);
    return { cid, txHash };
  }
}

// Example usage and configuration
async function publishPolybetsKnowledgeGraph() {
  // Configuration - these should be set via environment variables
  const config: PublishConfig = {
    spaceId: process.env.GRC20_SPACE_ID || 'your-space-id-here',
    privateKey: process.env.PRIVATE_KEY || 'your-private-key-here',
    network: (process.env.NETWORK as 'TESTNET' | 'MAINNET') || 'TESTNET',
    useSmartAccount: process.env.USE_SMART_ACCOUNT === 'true',
    editorAddress: process.env.EDITOR_ADDRESS
  };

  // Validate configuration
  if (!config.spaceId || config.spaceId === 'your-space-id-here') {
    throw new Error('GRC20_SPACE_ID environment variable must be set');
  }
  
  if (!config.privateKey || config.privateKey === 'your-private-key-here') {
    throw new Error('PRIVATE_KEY environment variable must be set');
  }

  const publisher = new PolybetsKnowledgeGraphPublisher(config);
  
  try {
    const result = await publisher.publishKnowledgeGraph();
    
    console.log('\n🎉 Publication Summary:');
    console.log(`📄 IPFS CID: ${result.cid}`);
    console.log(`🔗 Transaction: ${result.txHash}`);
    console.log(`🌐 Network: ${config.network}`);
    console.log(`📍 Space ID: ${config.spaceId}`);
    
    return result;
  } catch (error) {
    console.error('❌ Publication failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { PolybetsKnowledgeGraphPublisher, publishPolybetsKnowledgeGraph };

// For direct execution
if (require.main === module) {
  publishPolybetsKnowledgeGraph();
}
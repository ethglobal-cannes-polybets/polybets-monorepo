import { Graph, Ipfs } from '@graphprotocol/grc-20';
import { config } from 'dotenv';

// Load environment variables
config();

async function testMinimalPublish() {
  try {
    console.log('🧪 Testing minimal publish...');
    
    // Create just a basic entity without complex properties
    const ops: any[] = [];

    // Create a simple entity with minimal data
    const { id: entityId, ops: entityOps } = Graph.createEntity({
      name: 'PolyBets Test Market',
      description: 'A simple test market for PolyBets'
    });
    ops.push(...entityOps);

    console.log(`✅ Created entity with ${ops.length} operations`);
    console.log(`🆔 Entity ID: ${entityId}`);

    // Try to publish to IPFS
    console.log('📤 Publishing to IPFS...');
    
    const { cid } = await Ipfs.publishEdit({
      name: 'PolyBets Minimal Test',
      ops: ops,
      author: process.env.EDITOR_ADDRESS!,
      network: 'TESTNET'
    });

    console.log('✅ Successfully published to IPFS!');
    console.log(`📄 CID: ${cid}`);

    return { cid, entityId };
  } catch (error) {
    console.error('❌ Error in minimal publish test:', error);
    throw error;
  }
}

// For direct execution
if (require.main === module) {
  testMinimalPublish();
}

export { testMinimalPublish };
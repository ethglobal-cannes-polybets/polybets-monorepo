# PolyBets Knowledge Graph Troubleshooting Guide

## Common Issues and Solutions

### 1. JSON Parse Error in `createSpace()`

**Problem:** Getting `JSON.parse()` error when creating a space.

**Root Cause:** The `Graph.createSpace()` method returns an object with an `id` property, not a string directly.

**Solution:**
```typescript
// ❌ Wrong - assumes string return
const spaceId = await Graph.createSpace({...});

// ✅ Correct - handles object return
const spaceResult = await Graph.createSpace({...});
const spaceId = typeof spaceResult === 'string' ? spaceResult : spaceResult.id;
```

### 2. Space ID Not Found in .env

**Problem:** The `.env` file shows `[object Object]` instead of the actual space ID.

**Solution:** Use the corrected script `/Users/osx/Projects/ETH-Cannes-2025/polybets-monorepo/apps/knowledge-graph/create-polybets-space.ts` which properly extracts the ID from the result object.

### 3. Network Connection Issues

**Problem:** Timeouts or connection errors when calling GRC-20 APIs.

**Solutions:**
- Check network connectivity
- Verify you're using the correct API endpoints:
  - Testnet: `https://hypergraph-v2-testnet.up.railway.app`
  - Mainnet: `https://hypergraph-v2.up.railway.app`
- Wait and retry - sometimes rate limiting occurs
- Ensure your private key is valid

### 4. Entity Creation Errors

**Problem:** Errors when creating entities or publishing to the space.

**Solutions:**
- Ensure your space ID is correct in the `.env` file
- Verify your private key has sufficient testnet ETH
- Check that you're using the correct editor address
- Validate entity structure before publishing

### 5. Publishing Failures

**Problem:** Transactions fail when publishing entities.

**Solutions:**
- Get testnet ETH from: https://faucet.conduit.xyz/geo-test-zc16z3tcvf
- Use smart account for sponsored transactions (set `USE_SMART_ACCOUNT=true`)
- Verify the space exists and you have editor permissions
- Check gas limits and transaction data

## Best Practices

### 1. Environment Setup
```bash
# Ensure all required environment variables are set
PRIVATE_KEY=0x...           # Your wallet private key
GRC20_SPACE_ID=...         # Your space ID
NETWORK=TESTNET            # Network selection
USE_SMART_ACCOUNT=true     # For sponsored transactions
EDITOR_ADDRESS=0x...       # Your editor address
```

### 2. Space Creation
```typescript
// Always handle the object return properly
const spaceResult = await Graph.createSpace({
  editorAddress: account.address,
  name: 'Your Space Name',
  network: 'TESTNET'
});

const spaceId = typeof spaceResult === 'string' ? spaceResult : spaceResult.id;
```

### 3. Entity Publishing
```typescript
// Batch operations for efficiency
const ops = [];

// Add all entity creation operations
ops.push(...entityOps1);
ops.push(...entityOps2);

// Publish all at once
const { cid } = await Ipfs.publishEdit({
  name: 'Batch entity creation',
  ops: ops,
  author: editorAddress
});
```

### 4. Error Handling
```typescript
try {
  const result = await Graph.createSpace({...});
  const spaceId = typeof result === 'string' ? result : result.id;
} catch (error) {
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    console.error('JSON Parse Error - check network connectivity');
  }
  throw error;
}
```

## Debugging Steps

1. **Check Environment Variables**
   ```bash
   cat .env
   # Verify all required variables are set
   ```

2. **Test Network Connectivity**
   ```bash
   curl -X GET https://hypergraph-v2-testnet.up.railway.app/health
   # Should return 200 OK
   ```

3. **Verify Space Creation**
   ```bash
   bun run create-polybets-space.ts
   # Check output for space ID
   ```

4. **Test Entity Publishing**
   ```bash
   bun run publish
   # Should complete without errors
   ```

5. **Query the Knowledge Graph**
   ```bash
   bun run query
   # Should return entities from your space
   ```

## File Structure

```
knowledge-graph/
├── .env                              # Environment configuration
├── create-polybets-space.ts          # ✅ Corrected space creation
├── publish-entities.ts               # Entity publishing script
├── query-knowledge-graph.ts          # Query examples
├── polybets-space-info.json          # Space metadata
└── troubleshooting-guide.md          # This file
```

## Support Resources

- **GRC-20 Documentation**: https://docs.thegraph.com/grc20/
- **Testnet Faucet**: https://faucet.conduit.xyz/geo-test-zc16z3tcvf
- **Geo Wallet**: https://www.geobrowser.io/export-wallet
- **API Status**: Check network status at the API endpoints

## Next Steps

1. ✅ Use the corrected space creation script
2. ✅ Verify space ID in `.env` file
3. 🔄 Publish entities to your space
4. 🔄 Query the knowledge graph
5. 🔄 Build your PolyBets ecosystem mapping
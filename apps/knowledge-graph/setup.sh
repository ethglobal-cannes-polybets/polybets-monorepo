#!/bin/bash

echo "🚀 PolyBets Knowledge Graph Setup"
echo "================================="
echo ""

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first."
    echo "   Visit: https://bun.sh/"
    echo "   Run: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun $(bun --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create wallet and .env file
echo "🔐 Creating wallet and environment setup..."
bun run setup

if [ $? -ne 0 ]; then
    echo "❌ Failed to create wallet"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 What was created:"
echo "   ✓ New wallet with private key"
echo "   ✓ .env file with configuration"
echo "   ✓ All dependencies installed"
echo ""
echo "🚀 Next steps:"
echo "   1. Fund your wallet with testnet ETH (see instructions above)"
echo "   2. Create your GRC-20 space: bun run create-space"
echo "   3. Publish your knowledge graph: bun run publish"
echo ""
echo "⚠️  Security reminder: Keep your private key secure!"
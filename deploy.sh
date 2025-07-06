#!/bin/bash

# Set variables
SERVER="root@65.109.98.153"
REMOTE_DIR="/root/polybets"
LOCAL_DIR="$(dirname "$0")"

# No need to run a build step since Bun can run TypeScript files directly
echo "Deploying to $SERVER:$REMOTE_DIR..."

# Create the directory on the server if it doesn't exist
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Use rsync to transfer files, excluding those in .gitignore
rsync -avz --exclude-from=.gitignore \
  $LOCAL_DIR/ $SERVER:$REMOTE_DIR/ \
  --exclude=".git/"


echo "Files transferred successfully!"


# Start the server in background
echo "Starting server in background..."
ssh $SERVER "cd $REMOTE_DIR  && \
docker compose down && \
docker compose build && \
docker compose up -d"

echo "Deployment completed successfully!"


echo -n "$BASE_URL" | oasis rofl secret set BASE_URL -
echo -n "$BET_EXECUTION_BASE_URL" | oasis rofl secret set BET_EXECUTION_BASE_URL -
echo -n "$PRIVATE_KEY" | oasis rofl secret set PRIVATE_KEY -
echo -n "$SAPPHIRETESTNET_RPC_URL" | oasis rofl secret set SAPPHIRETESTNET_RPC_URL -
echo -n "$POLYBETS_CONTRACT_ADDRESS" | oasis rofl secret set POLYBETS_CONTRACT_ADDRESS -
echo -n "$POLYBETS_CONTRACT_ABI_PATH" | oasis rofl secret set POLYBETS_CONTRACT_ABI_PATH -
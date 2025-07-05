#!/bin/bash

# This script cleans the Hardhat cache, deploys the PolyBet contract to the Sapphire Testnet,
# verifies it, and prints the contract address and an explorer URL.

# Exit immediately if a command exits with a non-zero status.
set -e

# Get the directory of this script and change into it. This allows the script to be run from anywhere.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"
echo "Script directory: $SCRIPT_DIR"

echo "1. Cleaning Hardhat cache..."
#npx hardhat clean
#rm -rf ./ignition/deployments/

# IGNITION PATH, COMMENTED OUT BECAUSE IGNITION NOT WORKING WELL AGAINST OASIS
echo -e "\n2. Deploying PolyBet contract to Sapphire Testnet..."
# The deployment command will prompt for confirmation. We pipe "Y" to it.
# The output of the command is captured to extract the contract address.
# DEPLOY_OUTPUT=$(echo "Y" | npx hardhat ignition deploy ignition/modules/polybet.ts --network sapphiretestnet)

# Print the deployment output for visibility.
# echo "${DEPLOY_OUTPUT}"

# echo -e "\n3. Extracting contract address..."
# Grep for the line containing "PolyBetModule#PolyBet" and use awk to print the last field, which is the address.
# CONTRACT_ADDRESS=$(echo "${DEPLOY_OUTPUT}" | grep "PolyBetModule#PolyBet" | awk '{print $NF}')

# ===============================================
# ALTERNATE DEPLOYMENT PATH (COMMENTED OUT)
# ===============================================
# If you prefer to use scripts/deploy.ts instead of Hardhat Ignition:
#
# echo -e "\n2. Deploying PolyBet contract to Sapphire Testnet..."
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.ts --network sapphiretestnet)
# 
# # Print the deployment output for visibility.
echo "${DEPLOY_OUTPUT}"
# 
# echo -e "\n3. Extracting contract address..."
# # Grep for the line containing "PolyBet deployed to:" and extract the address
CONTRACT_ADDRESS=$(echo "${DEPLOY_OUTPUT}" | grep "PolyBet deployed to:" | awk '{print $NF}')
# ===============================================

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "Error: Could not extract the contract address from the deployment output."
  exit 1
fi

echo "   => Contract address: ${CONTRACT_ADDRESS}"

echo -e "\n4. Verifying contract on Sapphire Testnet explorer..."
# Verify the contract using the extracted address.
npx hardhat verify "${CONTRACT_ADDRESS}" --network sapphiretestnet

echo -e "\n5. Updating contract address in common package..."
CONFIG_FILE="${SCRIPT_DIR}/../packages/common/src/config.ts"
# Cross-platform sed handling
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' -e "s/export const polybetsContractAddress = \"0x[a-fA-F0-9]\{40\}\"/export const polybetsContractAddress = \"${CONTRACT_ADDRESS}\"/" "${CONFIG_FILE}"
else
  # Linux
  sed -i -e "s/export const polybetsContractAddress = \"0x[a-fA-F0-9]\{40\}\"/export const polybetsContractAddress = \"${CONTRACT_ADDRESS}\"/" "${CONFIG_FILE}"
fi
if [ $? -eq 0 ]; then
  echo "   => Updated ${CONFIG_FILE}"
else
  echo "   => Error updating ${CONFIG_FILE}"
  exit 1
fi

echo -e "\n6. Updating contract address in bet-router-rofl .env file..."
ENV_FILE="${SCRIPT_DIR}/../apps/bet-router-rofl/.env"
if [ -f "${ENV_FILE}" ]; then
  # Cross-platform sed handling
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' -e "s/^POLYBETS_CONTRACT_ADDRESS=.*/POLYBETS_CONTRACT_ADDRESS=\"${CONTRACT_ADDRESS}\"/" "${ENV_FILE}"
  else
    # Linux
    sed -i -e "s/^POLYBETS_CONTRACT_ADDRESS=.*/POLYBETS_CONTRACT_ADDRESS=\"${CONTRACT_ADDRESS}\"/" "${ENV_FILE}"
  fi
  if [ $? -eq 0 ]; then
    echo "   => Updated ${ENV_FILE}"
  else
    echo "   => Error updating ${ENV_FILE}"
    exit 1
  fi
else
  echo "   => ${ENV_FILE} not found, skipping"
fi

echo -e "\n7. Updating fallback address in bet-router-rofl main.py..."
MAIN_PY_FILE="${SCRIPT_DIR}/../apps/bet-router-rofl/main.py"
# Cross-platform sed handling
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' -e '/POLYBETS_CONTRACT_ADDRESS/,/)/s/"0x[a-fA-F0-9]\{40\}"/"'"${CONTRACT_ADDRESS}"'"/' "${MAIN_PY_FILE}"
else
  # Linux
  sed -i -e '/POLYBETS_CONTRACT_ADDRESS/,/)/s/"0x[a-fA-F0-9]\{40\}"/"'"${CONTRACT_ADDRESS}"'"/' "${MAIN_PY_FILE}"
fi
if [ $? -eq 0 ]; then
  echo "   => Updated ${MAIN_PY_FILE}"
else
  echo "   => Error updating ${MAIN_PY_FILE}"
  exit 1
fi

echo -e "\n----------------------------------------------------"
echo "✅ Contract deployed and verified successfully!"
echo "   Address: ${CONTRACT_ADDRESS}"
echo "   Explorer URL: https://explorer.oasis.io/testnet/sapphire/address/${CONTRACT_ADDRESS}"
echo "   Updated files:"
echo "     - packages/common/src/config.ts"
echo "     - apps/bet-router-rofl/.env (if exists)"
echo "     - apps/bet-router-rofl/main.py"
echo "----------------------------------------------------"

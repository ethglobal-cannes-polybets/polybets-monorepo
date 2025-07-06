# bet-router-rofl Scripts Documentation

This directory contains automated scripts to setup, test, and deploy the bet-router-rofl application.

## Quick Start

```bash
# 1. Initial setup
./setup.sh

# 2. Run tests
./test_compose.sh

# 3. Start the service
docker-compose up --build

# 4. Monitor health
./health-check.sh

# 5. Deploy to ROFL
./deploy.sh
```

## Scripts Overview

### 🚀 `setup.sh`
**Purpose**: Initial environment setup and configuration

**What it does**:
- Checks prerequisites (Docker, Docker Compose)
- Creates `.env` from `.env.example`
- Prompts for required configuration values
- Validates RPC connectivity
- Builds initial Docker image

**Usage**:
```bash
./setup.sh
```

**Requirements**: Docker, Docker Compose

---

### 🧪 `test_compose.sh`
**Purpose**: Comprehensive testing of Docker Compose setup

**What it tests**:
- Environment configuration
- Docker Compose validation
- Container build process
- Python dependencies
- RPC connectivity
- Smart contract connection
- Container lifecycle

**Usage**:
```bash
./test_compose.sh
```

**Output**: Detailed test results with ✅/❌ indicators

---

### 🏥 `health-check.sh`
**Purpose**: Monitor running service health

**Features**:
- Environment validation
- RPC connectivity check
- Service status monitoring
- Recent logs analysis
- Continuous monitoring mode

**Usage**:
```bash
# Single health check
./health-check.sh

# Continuous monitoring (Docker)
./health-check.sh --continuous

# Monitor ROFL deployment
./health-check.sh --rofl --continuous

# Custom interval
./health-check.sh --continuous --interval 60
```

**Options**:
- `--continuous`: Run continuous monitoring
- `--rofl`: Monitor ROFL deployment instead of Docker
- `--interval N`: Check interval in seconds (default: 30)

---

### 🚢 `deploy.sh`
**Purpose**: Deploy to Oasis ROFL environment

**What it does**:
- Validates prerequisites (Oasis CLI, Docker)
- Runs pre-deployment tests
- Builds and tags Docker image
- Pushes to GitHub Container Registry
- Deploys to Oasis ROFL
- Verifies deployment

**Usage**:
```bash
./deploy.sh
```

**Requirements**: 
- Oasis CLI installed
- GitHub Container Registry access
- Oasis wallet configured

---

## Environment Configuration

### `.env.example`
Template file with all required environment variables:

```bash
PRIVATE_KEY=your_private_key_here
SAPPHIRETESTNET_RPC_URL=https://oasis-sapphire-testnet.core.chainstack.com/...
POLYBETS_CONTRACT_ADDRESS=0xaecDA91C878735D6a24A53EbE9C2F7b6c47C9454
BASE_URL=http://localhost:3000
BET_EXECUTION_BASE_URL=http://localhost:3000
```

### Required Variables
- `PRIVATE_KEY`: Your private key for transaction signing
- `SAPPHIRETESTNET_RPC_URL`: Oasis Sapphire testnet RPC endpoint
- `POLYBETS_CONTRACT_ADDRESS`: PolyBet smart contract address

## Common Workflows

### Development Workflow
```bash
# Initial setup
./setup.sh

# Test everything
./test_compose.sh

# Start development environment
docker-compose up --build

# Monitor in another terminal
./health-check.sh --continuous
```

### Production Deployment
```bash
# Ensure tests pass
./test_compose.sh

# Deploy to ROFL
./deploy.sh

# Monitor ROFL deployment
./health-check.sh --rofl --continuous
```

### Troubleshooting
```bash
# Check current status
./health-check.sh

# View detailed logs
docker-compose logs -f

# Restart service
docker-compose down && docker-compose up --build

# Test configuration
./test_compose.sh
```

## Prerequisites

### For Local Development
- Docker
- Docker Compose
- bash shell

### For ROFL Deployment
- Oasis CLI (v0.14.1+)
- GitHub Container Registry access
- Configured Oasis wallet

### Installation Commands

**Oasis CLI (macOS)**:
```bash
curl -L -o oasis_cli.tar.gz https://github.com/oasisprotocol/cli/releases/download/v0.14.1/oasis_cli_0.14.1_darwin_all.tar.gz
tar -xzf oasis_cli.tar.gz
sudo mv oasis_cli_*/oasis /usr/local/bin/
```

**Oasis Wallet Setup**:
```bash
oasis wallet import ethglobal_cannes
# Select: private key, secp256k1-raw
# Enter your private key
```

## Error Handling

All scripts include comprehensive error handling and provide helpful error messages. Common issues:

1. **Missing prerequisites**: Scripts will guide you to install required tools
2. **Configuration errors**: Clear messages about missing/invalid environment variables
3. **Connection issues**: RPC and contract connectivity tests with specific error details
4. **Deployment failures**: Detailed error messages and suggested fixes

## Script Features

- **Color-coded output**: Green ✅, Red ❌, Yellow ⚠️, Blue ℹ️
- **Progress indicators**: Clear progress through each step
- **Error recovery**: Helpful suggestions when things fail
- **Comprehensive logging**: Detailed output for debugging
- **Safe execution**: Scripts validate prerequisites and configuration

## File Structure

```
bet-router-rofl/
├── setup.sh              # Initial setup
├── test_compose.sh        # Comprehensive testing
├── health-check.sh        # Health monitoring
├── deploy.sh             # ROFL deployment
├── .env.example          # Environment template
├── compose.yaml          # Docker Compose configuration
├── rofl.yaml            # ROFL deployment configuration
└── README_SCRIPTS.md    # This documentation
```
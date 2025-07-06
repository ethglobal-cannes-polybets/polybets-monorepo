# Deployment Guide for bet-router-rofl

This guide covers the deployment process for the bet-router-rofl application to Oasis ROFL (Runtime Overlay Function Layer).

## Prerequisites

### System Requirements
- Docker and Docker Compose
- Oasis CLI v0.14.1+
- Bash shell
- curl (for connectivity tests)

### Installation Scripts
Run these scripts in order:

```bash
# 1. Install Oasis CLI
./install-oasis-cli.sh

# 2. Initial setup and configuration
./setup.sh

# 3. Test configuration (optional but recommended)
./test_compose.sh
```

## Deployment Methods

### Method 1: Quick Deployment (Recommended)

```bash
./deploy-oasis.sh
```

This script will:
- Check all prerequisites
- Validate wallet configuration
- Build ROFL bundle
- Deploy via marketplace with interactive options
- Verify deployment

### Method 2: Full Deployment Pipeline

```bash
./deploy.sh
```

This comprehensive script includes:
- Pre-deployment testing
- Docker image building and registry push
- Complete ROFL deployment
- Post-deployment verification

## Step-by-Step Manual Deployment

### 1. Initial Setup

```bash
# Clone and navigate to project
cd apps/bet-router-rofl

# Run setup script
./setup.sh
```

The setup script will:
- Check Docker installation
- Create `.env` from `.env.example`
- Prompt for required configuration values
- Build initial Docker image

### 2. Configure Environment

Edit `.env` file with required values:

```bash
# Required: Your private key
PRIVATE_KEY=your_private_key_here

# RPC endpoint (default provided)
SAPPHIRETESTNET_RPC_URL=https://oasis-sapphire-testnet.core.chainstack.com/86690140e8855e0871e6059dac29a04c
```

### 3. Wallet Configuration

Import your wallet for Oasis CLI:

```bash
oasis wallet import ethglobal_cannes
```

Select:
- Kind: `private key`
- Algorithm: `secp256k1-raw`
- Enter your private key
- Set a passphrase

### 4. Build and Test

```bash
# Test the application
./test_compose.sh

# Build Docker image
docker-compose build
```

### 5. Registry Setup (Optional)

For GitHub Container Registry:

```bash
# Login to registry
docker login ghcr.io -u <username>
# Use Personal Access Token as password

# Tag and push image
docker tag bet-router-rofl_bet-router-rofl:latest ghcr.io/ethglobal-cannes-polybets/bet-router-rofl:latest
docker push ghcr.io/ethglobal-cannes-polybets/bet-router-rofl:latest
```

### 6. Deploy to ROFL

```bash
# Build ROFL bundle
oasis rofl build

# Deploy to marketplace
oasis rofl deploy
```

## Configuration Files

### rofl.yaml
ROFL deployment configuration:
- **App ID**: `rofl1qq0cngawpv7szfwzja5kwadvwjyd8mcsqysunsnf`
- **Network**: `testnet`
- **ParaTime**: `sapphire`
- **TEE**: `tdx` (Intel TDX)
- **Resources**: 1 CPU, 512MB memory, 512MB persistent storage

### compose.yaml
Docker Compose configuration for local development and ROFL deployment.

## Deployment Verification

After deployment, verify the application:

```bash
# Check deployment status
oasis rofl show bet-router-rofl

# View application logs
oasis rofl logs bet-router-rofl

# Follow logs in real-time
oasis rofl logs bet-router-rofl -f
```

## Management Commands

```bash
# Application lifecycle
oasis rofl start bet-router-rofl    # Start application
oasis rofl stop bet-router-rofl     # Stop application
oasis rofl remove bet-router-rofl   # Remove application

# Monitoring
oasis rofl show bet-router-rofl     # Show status and details
oasis rofl logs bet-router-rofl     # View logs

# Health check
./health-check.sh                   # Run health checks
./monitor-oasis.sh                  # Monitor deployment
```

## Troubleshooting

### Common Issues

1. **Oasis CLI not found**
   ```bash
   ./install-oasis-cli.sh
   ```

2. **Wallet not configured**
   ```bash
   oasis wallet import ethglobal_cannes
   ```

3. **Environment not configured**
   ```bash
   ./setup.sh
   ```

4. **Docker build fails**
   ```bash
   docker system prune -f
   docker-compose build --no-cache
   ```

5. **RPC connectivity issues**
   - Verify RPC URL in `.env`
   - Check network connectivity
   - Ensure Sapphire testnet is accessible

### Log Analysis

```bash
# Application logs
oasis rofl logs bet-router-rofl

# Docker logs (local)
docker-compose logs -f

# System logs
./monitor-oasis.sh
```

## Network Information

- **Network**: Oasis Sapphire Testnet
- **Chain ID**: Check current configuration
- **RPC**: `https://oasis-sapphire-testnet.core.chainstack.com/...`
- **Explorer**: Oasis Explorer (testnet)

## Security Notes

- Keep private keys secure and never commit them to version control
- Use environment variables for sensitive configuration
- Regularly rotate access tokens and credentials
- Monitor deployment logs for suspicious activity

## Support Scripts

- `install-oasis-cli.sh` - Install Oasis CLI
- `setup.sh` - Initial configuration
- `deploy.sh` - Full deployment pipeline
- `deploy-oasis.sh` - Quick ROFL deployment
- `test_compose.sh` - Run tests
- `health-check.sh` - Health monitoring
- `monitor-oasis.sh` - Deployment monitoring
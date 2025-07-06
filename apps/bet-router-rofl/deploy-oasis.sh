#!/bin/bash
# deploy-oasis.sh - Deploy bet-router-rofl to Oasis ROFL
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "\n${BLUE}=== $1 ===${NC}"; }

log_header "Deploying bet-router-rofl to Oasis ROFL"

# Check prerequisites
log_info "1. Checking prerequisites..."

if ! command -v oasis &> /dev/null; then
    log_error "Oasis CLI not found. Run ./install-oasis-cli.sh first"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker"
    exit 1
fi

log_success "Prerequisites OK"

# Check wallet
log_info "2. Checking wallet configuration..."

if ! oasis wallet list | grep -q "ethglobal_cannes"; then
    log_error "Wallet 'ethglobal_cannes' not found. Please import it:"
    echo "  oasis wallet import ethglobal_cannes"
    exit 1
fi

log_success "Wallet configured"

# Check ROFL configuration
log_info "3. Validating ROFL configuration..."

if [[ ! -f "rofl.yaml" ]]; then
    log_error "rofl.yaml not found"
    exit 1
fi

APP_ID=$(grep 'app_id:' rofl.yaml | awk '{print $2}')
NETWORK=$(grep 'network:' rofl.yaml | awk '{print $2}')
PARATIME=$(grep 'paratime:' rofl.yaml | awk '{print $2}')

log_info "Configuration:"
echo "  App ID: $APP_ID"
echo "  Network: $NETWORK"  
echo "  ParaTime: $PARATIME"

# Build and deploy
log_info "4. Building ROFL bundle..."

if oasis rofl build; then
    log_success "ROFL bundle built successfully"
else
    log_error "ROFL build failed"
    exit 1
fi

# Deploy via marketplace
log_info "5. Deploying to Oasis ROFL Marketplace..."

echo "Deployment options:"
echo "  [1] Quick deploy (recommended)"
echo "  [2] Show available offers first"
echo "  [3] Deploy with custom resources"
echo -n "Choose option (1-3): "
read -r choice

case $choice in
    1)
        log_info "Deploying with default configuration..."
        if oasis rofl deploy; then
            log_success "Deployment successful! 🎉"
        else
            log_error "Deployment failed"
            exit 1
        fi
        ;;
    2)
        log_info "Showing available offers..."
        oasis rofl deploy --show-offers
        echo -n "Proceed with deployment? (y/n): "
        read -r proceed
        if [[ "$proceed" == "y" ]]; then
            oasis rofl deploy
        fi
        ;;
    3)
        log_info "Deploying with custom resources..."
        oasis rofl deploy \
            --memory 1Gi \
            --cpu 1000m \
            --storage 1Gi \
            --paratime sapphire-testnet
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

# Post-deployment verification
log_info "6. Verifying deployment..."

if oasis rofl show bet-router-rofl; then
    log_success "Deployment verified successfully!"
    
    log_info "Useful commands:"
    echo "  oasis rofl show bet-router-rofl     # Check status"
    echo "  oasis rofl logs bet-router-rofl     # View logs"
    echo "  oasis rofl stop bet-router-rofl     # Stop app"
    echo "  oasis rofl start bet-router-rofl    # Start app"
    echo "  oasis rofl remove bet-router-rofl   # Remove app"
    
else
    log_warning "Could not verify deployment status"
fi

log_header "Deployment Complete! 🚀"
log_success "bet-router-rofl is now running on Oasis ROFL"
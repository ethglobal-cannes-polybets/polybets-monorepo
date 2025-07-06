#!/bin/bash
# deploy.sh - Deployment script for bet-router-rofl to Oasis ROFL
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Configuration
GITHUB_REGISTRY="ghcr.io/ethglobal-cannes-polybets/bet-router-rofl"
IMAGE_TAG="latest"

log_header "bet-router-rofl ROFL Deployment"

# Check if we're in the right directory
if [[ ! -f "rofl.yaml" ]]; then
    log_error "rofl.yaml not found. Please run this script from the bet-router-rofl directory."
    exit 1
fi

# Step 1: Check prerequisites
log_info "1. Checking prerequisites..."

# Check Oasis CLI
if ! command -v oasis &> /dev/null; then
    log_error "Oasis CLI is not installed. Please install it first:"
    echo "  curl -L -o oasis_cli.tar.gz https://github.com/oasisprotocol/cli/releases/download/v0.14.1/oasis_cli_0.14.1_darwin_all.tar.gz"
    echo "  tar -xzf oasis_cli.tar.gz"
    echo "  sudo mv oasis_cli_*/oasis /usr/local/bin/"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

log_success "Prerequisites check passed"

# Step 2: Environment validation
log_info "2. Validating environment..."

if [[ ! -f ".env" ]]; then
    log_error ".env file not found. Please run ./setup.sh first."
    exit 1
fi

source .env

if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "your_private_key_here" ]]; then
    log_error "PRIVATE_KEY not configured. Please run ./setup.sh first."
    exit 1
fi

log_success "Environment validation passed"

# Step 3: Run tests before deployment
log_info "3. Running pre-deployment tests..."

if [[ -f "./test_compose.sh" ]]; then
    if ./test_compose.sh; then
        log_success "Pre-deployment tests passed"
    else
        log_error "Pre-deployment tests failed. Please fix issues before deploying."
        exit 1
    fi
else
    log_warning "test_compose.sh not found, skipping tests"
fi

# Step 4: Build and tag Docker image
log_info "4. Building Docker image for deployment..."

if docker-compose build; then
    log_success "Docker build successful"
else
    log_error "Docker build failed"
    exit 1
fi

# Tag the image for registry
docker tag bet-router-rofl_bet-router-rofl:latest "$GITHUB_REGISTRY:$IMAGE_TAG"
log_success "Image tagged as $GITHUB_REGISTRY:$IMAGE_TAG"

# Step 5: Push to registry (optional - requires authentication)
log_info "5. Pushing image to registry..."

echo "Do you want to push the image to GitHub Container Registry? (y/n)"
read -r push_choice

if [[ "$push_choice" == "y" || "$push_choice" == "Y" ]]; then
    log_info "Pushing to $GITHUB_REGISTRY:$IMAGE_TAG..."
    log_info "Make sure you're logged in: docker login ghcr.io -u <username>"
    
    if docker push "$GITHUB_REGISTRY:$IMAGE_TAG"; then
        log_success "Image pushed successfully"
    else
        log_warning "Image push failed. You may need to authenticate:"
        echo "  docker login ghcr.io -u <your-github-username>"
        echo "  # Use Personal Access Token as password"
    fi
else
    log_info "Skipping image push"
fi

# Step 6: Check Oasis wallet
log_info "6. Checking Oasis wallet configuration..."

if oasis wallet list | grep -q "ethglobal_cannes"; then
    log_success "Oasis wallet 'ethglobal_cannes' found"
else
    log_error "Oasis wallet 'ethglobal_cannes' not found. Please set it up:"
    echo "  oasis wallet import ethglobal_cannes"
    echo "  # Select: private key, secp256k1-raw"
    echo "  # Enter your private key"
    exit 1
fi

# Step 7: Validate ROFL configuration
log_info "7. Validating ROFL configuration..."

if oasis rofl show bet-router-rofl &> /dev/null; then
    log_success "ROFL configuration valid"
else
    log_error "ROFL configuration validation failed"
    echo "Please check rofl.yaml configuration"
    exit 1
fi

# Step 8: Deploy to ROFL
log_info "8. Deploying to Oasis ROFL..."

echo "This will deploy bet-router-rofl to the Oasis ROFL environment."
echo "Deployment details:"
echo "  App ID: $(grep 'app_id:' rofl.yaml | cut -d' ' -f4)"
echo "  Network: $(grep 'network:' rofl.yaml | cut -d' ' -f4)"
echo "  Paratime: $(grep 'paratime:' rofl.yaml | cut -d' ' -f4)"
echo
echo "Continue with deployment? (y/n)"
read -r deploy_choice

if [[ "$deploy_choice" == "y" || "$deploy_choice" == "Y" ]]; then
    log_info "Starting ROFL deployment..."
    
    if oasis rofl deploy bet-router-rofl; then
        log_success "ROFL deployment successful! 🎉"
        
        # Get deployment info
        APP_ID=$(grep 'app_id:' rofl.yaml | cut -d' ' -f4)
        log_info "Deployment information:"
        echo "  App ID: $APP_ID"
        echo "  Status: Use 'oasis rofl show bet-router-rofl' to check status"
        echo "  Logs: Use 'oasis rofl logs bet-router-rofl' to view logs"
        
    else
        log_error "ROFL deployment failed"
        echo "Check the error messages above and try again"
        exit 1
    fi
else
    log_info "Deployment cancelled"
    exit 0
fi

# Step 9: Post-deployment verification
log_info "9. Post-deployment verification..."

sleep 10  # Wait for deployment to stabilize

log_info "Checking deployment status..."
if oasis rofl show bet-router-rofl; then
    echo
    log_success "Deployment verification complete"
    
    log_info "Useful commands:"
    echo "  oasis rofl show bet-router-rofl    # Check status"
    echo "  oasis rofl logs bet-router-rofl    # View logs"
    echo "  oasis rofl stop bet-router-rofl    # Stop the app"
    echo "  oasis rofl start bet-router-rofl   # Start the app"
    
else
    log_warning "Could not verify deployment status"
fi

log_header "Deployment Complete! 🚀"
echo
log_success "bet-router-rofl has been deployed to Oasis ROFL"
log_info "The service is now running and listening for BetSlipCreated events"
echo
log_info "Monitor the deployment:"
echo "  oasis rofl logs bet-router-rofl -f  # Follow logs in real-time"
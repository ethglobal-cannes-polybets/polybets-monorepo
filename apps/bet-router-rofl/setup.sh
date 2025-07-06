#!/bin/bash
# setup.sh - Initial setup script for bet-router-rofl
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

log_header "bet-router-rofl Setup"

# Check if we're in the right directory
if [[ ! -f "compose.yaml" ]]; then
    log_error "compose.yaml not found. Please run this script from the bet-router-rofl directory."
    exit 1
fi

# Step 1: Check prerequisites
log_info "1. Checking prerequisites..."

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

# Check if Docker is running
if ! docker info &> /dev/null; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

log_success "Prerequisites check passed"

# Step 2: Environment setup
log_info "2. Setting up environment..."

if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        log_success "Created .env from .env.example"
    else
        log_error "No .env.example found. Cannot create environment file."
        exit 1
    fi
else
    log_info ".env file already exists"
fi

# Step 3: Prompt user for required values
log_info "3. Configuring environment variables..."

# Function to update env variable
update_env_var() {
    local var_name=$1
    local prompt_text=$2
    local current_value=$(grep "^${var_name}=" .env | cut -d'=' -f2-)
    
    if [[ -z "$current_value" || "$current_value" == "your_private_key_here" || "$current_value" == "your_rpc_url_here" ]]; then
        echo -n "$prompt_text: "
        read -r new_value
        if [[ -n "$new_value" ]]; then
            # Update the .env file
            if grep -q "^${var_name}=" .env; then
                sed -i.bak "s|^${var_name}=.*|${var_name}=${new_value}|" .env
            else
                echo "${var_name}=${new_value}" >> .env
            fi
            log_success "Updated $var_name"
        else
            log_warning "Skipped $var_name (you can edit .env manually later)"
        fi
    else
        log_info "$var_name already configured"
    fi
}

# Check if running interactively
if [[ -t 0 ]]; then
    echo
    log_info "Please provide the following configuration values:"
    echo "  (Press Enter to skip and configure manually later)"
    echo
    
    update_env_var "PRIVATE_KEY" "Enter your private key"
    update_env_var "SAPPHIRETESTNET_RPC_URL" "Enter Sapphire testnet RPC URL (or press Enter for default)"
    
    # Set default RPC if not provided
    if ! grep -q "SAPPHIRETESTNET_RPC_URL=https://" .env; then
        sed -i.bak "s|^SAPPHIRETESTNET_RPC_URL=.*|SAPPHIRETESTNET_RPC_URL=https://oasis-sapphire-testnet.core.chainstack.com/86690140e8855e0871e6059dac29a04c|" .env
        log_info "Set default RPC URL"
    fi
else
    log_warning "Running in non-interactive mode. Please edit .env manually."
fi

# Clean up backup files
rm -f .env.bak

# Step 4: Validate configuration
log_info "4. Validating configuration..."

source .env
config_valid=true

if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "your_private_key_here" ]]; then
    log_error "PRIVATE_KEY not configured in .env"
    config_valid=false
fi

if [[ -z "$SAPPHIRETESTNET_RPC_URL" ]]; then
    log_error "SAPPHIRETESTNET_RPC_URL not configured in .env"
    config_valid=false
fi

if [[ "$config_valid" == "false" ]]; then
    log_error "Configuration incomplete. Please edit .env and run setup again."
    exit 1
fi

log_success "Configuration validation passed"

# Step 5: Test RPC connectivity (optional)
log_info "5. Testing RPC connectivity (optional)..."

if command -v curl &> /dev/null; then
    if curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        "$SAPPHIRETESTNET_RPC_URL" | grep -q "result"; then
        log_success "RPC connectivity test passed"
    else
        log_warning "RPC connectivity test failed. Please verify your RPC URL."
    fi
else
    log_info "curl not available, skipping RPC test"
fi

# Step 6: Build initial image
log_info "6. Building Docker image..."

if docker-compose build; then
    log_success "Docker image built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# Step 7: Final instructions
log_header "Setup Complete! 🎉"
echo
log_success "bet-router-rofl is now configured and ready to use."
echo
log_info "Next steps:"
echo "  1. Run tests:           ./test_compose.sh"
echo "  2. Start the service:   docker-compose up"
echo "  3. Watch logs:          docker-compose logs -f"
echo "  4. Deploy to ROFL:      ./deploy.sh"
echo
log_info "Configuration files:"
echo "  .env              - Environment variables"
echo "  compose.yaml      - Docker Compose configuration"
echo "  rofl.yaml         - ROFL deployment configuration"
echo
if [[ "$config_valid" == "true" ]]; then
    log_info "✨ Ready to run: ./test_compose.sh"
else
    log_warning "Please complete .env configuration before proceeding"
fi
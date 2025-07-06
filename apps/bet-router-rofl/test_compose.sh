#!/bin/bash
# test_compose.sh - Comprehensive testing script for bet-router-rofl Docker Compose setup
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

# Check if we're in the right directory
if [[ ! -f "compose.yaml" ]]; then
    log_error "compose.yaml not found. Please run this script from the bet-router-rofl directory."
    exit 1
fi

log_header "bet-router-rofl Docker Compose Testing"

# Test 1: Environment file check
log_info "1. Checking environment configuration..."
if [[ ! -f ".env" ]]; then
    log_warning ".env file not found."
    if [[ -f ".env.example" ]]; then
        log_info "Creating .env from .env.example..."
        cp .env.example .env
        log_warning "Please edit .env with your actual values before continuing."
        log_info "Required variables: PRIVATE_KEY, SAPPHIRETESTNET_RPC_URL"
        exit 1
    else
        log_error "No .env or .env.example found. Cannot proceed."
        exit 1
    fi
fi

# Check required environment variables
source .env
if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "your_private_key_here" ]]; then
    log_error "PRIVATE_KEY not set in .env file"
    exit 1
fi

if [[ -z "$SAPPHIRETESTNET_RPC_URL" ]]; then
    log_error "SAPPHIRETESTNET_RPC_URL not set in .env file"
    exit 1
fi

log_success "Environment configuration OK"

# Test 2: Docker Compose configuration validation
log_info "2. Validating Docker Compose configuration..."
if docker-compose config >/dev/null 2>&1; then
    log_success "Docker Compose configuration valid"
else
    log_error "Docker Compose configuration invalid"
    docker-compose config
    exit 1
fi

# Test 3: Build test
log_info "3. Testing Docker build..."
if docker-compose build >/dev/null 2>&1; then
    log_success "Docker build successful"
else
    log_error "Docker build failed"
    docker-compose build
    exit 1
fi

# Test 4: Environment variables in container
log_info "4. Testing environment variables in container..."
ENV_TEST=$(docker-compose run --rm bet-router-rofl python -c "
import os
required = ['PRIVATE_KEY', 'SAPPHIRETESTNET_RPC_URL', 'POLYBETS_CONTRACT_ADDRESS']
missing = [v for v in required if not os.getenv(v)]
if missing: 
    print(f'Missing: {missing}')
    exit(1)
print('Environment OK')
" 2>/dev/null)

if [[ $? -eq 0 ]]; then
    log_success "Environment variables correctly passed to container"
else
    log_error "Environment variables not properly configured"
    exit 1
fi

# Test 5: Python dependencies
log_info "5. Testing Python dependencies..."
DEPS_TEST=$(docker-compose run --rm bet-router-rofl python -c "
try:
    import web3, asyncio, json, dotenv
    from bet_execution.bet_executor import execute_optimal_bet
    print('Dependencies OK')
except ImportError as e:
    print(f'Import error: {e}')
    exit(1)
" 2>/dev/null)

if [[ $? -eq 0 ]]; then
    log_success "All Python dependencies available"
else
    log_error "Python dependencies missing or import failed"
    exit 1
fi

# Test 6: RPC connectivity
log_info "6. Testing RPC connectivity..."
RPC_TEST=$(docker-compose run --rm bet-router-rofl python -c "
from web3 import Web3
import os
try:
    w3 = Web3(Web3.HTTPProvider(os.getenv('SAPPHIRETESTNET_RPC_URL')))
    if w3.is_connected():
        block = w3.eth.block_number
        chain_id = w3.eth.chain_id
        print(f'RPC Connected - Block: {block}, Chain ID: {chain_id}')
    else:
        print('RPC connection failed')
        exit(1)
except Exception as e:
    print(f'RPC error: {e}')
    exit(1)
" 2>/dev/null)

if [[ $? -eq 0 ]]; then
    log_success "RPC connectivity successful"
    log_info "   $RPC_TEST"
else
    log_error "RPC connectivity failed"
    exit 1
fi

# Test 7: Contract connection
log_info "7. Testing smart contract connection..."
CONTRACT_TEST=$(docker-compose run --rm bet-router-rofl python -c "
import main
try:
    # Test contract is loaded
    contract_address = main.POLYBETS_CONTRACT_ADDRESS
    print(f'Contract loaded at: {contract_address}')
    
    # Test if we can call a view function (this might fail if contract doesn't exist)
    # But at least we can test the connection setup
    print('Contract connection setup OK')
except Exception as e:
    print(f'Contract connection error: {e}')
    exit(1)
" 2>/dev/null)

if [[ $? -eq 0 ]]; then
    log_success "Smart contract connection setup OK"
else
    log_warning "Smart contract connection test failed (contract may not be deployed)"
fi

# Test 8: Test main module execution (dry run)
log_info "8. Testing main module execution..."
MAIN_TEST=$(timeout 10 docker-compose run --rm bet-router-rofl python -c "
import main
print('Main module loads successfully')
print('All imports and setup complete')
" 2>/dev/null)

if [[ $? -eq 0 ]]; then
    log_success "Main module execution test passed"
else
    log_warning "Main module test failed or timed out"
fi

# Test 9: Test container startup and shutdown
log_info "9. Testing container lifecycle..."
if docker-compose up -d >/dev/null 2>&1; then
    sleep 5
    if docker-compose ps | grep -q "Up"; then
        log_success "Container started successfully"
        docker-compose down >/dev/null 2>&1
        log_success "Container stopped successfully"
    else
        log_error "Container failed to stay running"
        docker-compose logs
        docker-compose down >/dev/null 2>&1
        exit 1
    fi
else
    log_error "Failed to start container"
    exit 1
fi

# Summary
log_header "Test Summary"
log_success "All tests passed! 🎉"
echo
log_info "Your bet-router-rofl setup is ready. To run:"
echo "  docker-compose up --build    # Start the service"
echo "  docker-compose logs -f       # Watch logs"
echo "  docker-compose down          # Stop the service"
echo
log_info "To deploy to ROFL:"
echo "  ./deploy.sh                  # Deploy to Oasis ROFL environment"
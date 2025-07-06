#!/bin/bash
# health-check.sh - Health monitoring script for bet-router-rofl
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
CHECK_INTERVAL=30  # seconds
DEPLOYMENT_NAME="bet-router-rofl"

# Parse command line arguments
CONTINUOUS=false
DOCKER_MODE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --continuous)
            CONTINUOUS=true
            shift
            ;;
        --rofl)
            DOCKER_MODE=false
            shift
            ;;
        --interval)
            CHECK_INTERVAL="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --continuous    Run continuous monitoring"
            echo "  --rofl         Monitor ROFL deployment instead of Docker"
            echo "  --interval N   Check interval in seconds (default: 30)"
            echo "  -h, --help     Show this help"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_header "bet-router-rofl Health Check"

# Check prerequisites
check_prerequisites() {
    if [[ "$DOCKER_MODE" == "true" ]]; then
        if ! command -v docker-compose &> /dev/null; then
            log_error "Docker Compose not found"
            return 1
        fi
        
        if [[ ! -f "compose.yaml" ]]; then
            log_error "compose.yaml not found. Run from bet-router-rofl directory."
            return 1
        fi
    else
        if ! command -v oasis &> /dev/null; then
            log_error "Oasis CLI not found"
            return 1
        fi
    fi
    return 0
}

# Check Docker Compose service health
check_docker_health() {
    local status="🔴 DOWN"
    local container_status=""
    local logs_tail=""
    
    # Check if service is running
    if docker-compose ps | grep -q "Up"; then
        status="🟢 UP"
        
        # Get container status details
        container_status=$(docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | tail -n +2)
        
        # Get recent logs (last 5 lines)
        logs_tail=$(docker-compose logs --tail=5 bet-router-rofl 2>/dev/null | tail -5)
        
        # Check for errors in recent logs
        if echo "$logs_tail" | grep -iq "error\|exception\|failed"; then
            status="🟡 UP (with errors)"
        fi
    fi
    
    echo "Status: $status"
    if [[ -n "$container_status" ]]; then
        echo "Container: $container_status"
    fi
    
    if [[ -n "$logs_tail" ]]; then
        echo "Recent logs:"
        echo "$logs_tail" | sed 's/^/  /'
    fi
    
    return 0
}

# Check ROFL deployment health
check_rofl_health() {
    local status="🔴 DOWN"
    local app_info=""
    
    # Check ROFL status
    if oasis rofl show "$DEPLOYMENT_NAME" &> /dev/null; then
        app_info=$(oasis rofl show "$DEPLOYMENT_NAME" 2>/dev/null)
        
        if echo "$app_info" | grep -q "running\|active"; then
            status="🟢 UP"
        elif echo "$app_info" | grep -q "stopped\|inactive"; then
            status="🔴 STOPPED"
        else
            status="🟡 UNKNOWN"
        fi
        
        echo "Status: $status"
        echo "App Info:"
        echo "$app_info" | head -10 | sed 's/^/  /'
        
        # Try to get recent logs
        local recent_logs
        recent_logs=$(oasis rofl logs "$DEPLOYMENT_NAME" --tail=5 2>/dev/null || echo "Logs not available")
        
        if [[ "$recent_logs" != "Logs not available" ]]; then
            echo "Recent logs:"
            echo "$recent_logs" | sed 's/^/  /'
        fi
    else
        echo "Status: $status (not deployed or not accessible)"
    fi
    
    return 0
}

# Check environment configuration
check_environment() {
    if [[ ! -f ".env" ]]; then
        log_warning "No .env file found"
        return 1
    fi
    
    source .env
    
    local config_ok=true
    
    if [[ -z "$PRIVATE_KEY" || "$PRIVATE_KEY" == "your_private_key_here" ]]; then
        log_warning "PRIVATE_KEY not configured"
        config_ok=false
    fi
    
    if [[ -z "$SAPPHIRETESTNET_RPC_URL" ]]; then
        log_warning "SAPPHIRETESTNET_RPC_URL not configured"
        config_ok=false
    fi
    
    if [[ "$config_ok" == "true" ]]; then
        log_success "Environment configuration OK"
    else
        log_warning "Environment configuration incomplete"
    fi
    
    return 0
}

# Test RPC connectivity
test_rpc_connectivity() {
    if [[ ! -f ".env" ]]; then
        log_warning "Cannot test RPC: .env not found"
        return 1
    fi
    
    source .env
    
    if [[ -z "$SAPPHIRETESTNET_RPC_URL" ]]; then
        log_warning "Cannot test RPC: SAPPHIRETESTNET_RPC_URL not set"
        return 1
    fi
    
    if command -v curl &> /dev/null; then
        local response
        response=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            "$SAPPHIRETESTNET_RPC_URL" 2>/dev/null)
        
        if echo "$response" | grep -q "result"; then
            local block_hex
            block_hex=$(echo "$response" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
            local block_number=$((16#${block_hex#0x}))
            log_success "RPC connected (block: $block_number)"
        else
            log_warning "RPC connectivity test failed"
        fi
    else
        log_info "curl not available, skipping RPC test"
    fi
    
    return 0
}

# Perform single health check
perform_health_check() {
    local timestamp
    timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    echo "Health check at $timestamp"
    echo "----------------------------------------"
    
    # Environment check
    log_info "Environment Configuration:"
    check_environment
    echo
    
    # RPC connectivity check
    log_info "RPC Connectivity:"
    test_rpc_connectivity
    echo
    
    # Service health check
    if [[ "$DOCKER_MODE" == "true" ]]; then
        log_info "Docker Compose Service:"
        check_docker_health
    else
        log_info "ROFL Deployment:"
        check_rofl_health
    fi
    
    echo
}

# Main execution
main() {
    if ! check_prerequisites; then
        exit 1
    fi
    
    if [[ "$CONTINUOUS" == "true" ]]; then
        log_info "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
        log_info "Press Ctrl+C to stop"
        echo
        
        while true; do
            perform_health_check
            echo "Waiting ${CHECK_INTERVAL} seconds..."
            echo "========================================"
            echo
            sleep "$CHECK_INTERVAL"
        done
    else
        perform_health_check
    fi
}

# Handle Ctrl+C gracefully
trap 'echo; log_info "Health monitoring stopped"; exit 0' INT

# Run main function
main "$@"
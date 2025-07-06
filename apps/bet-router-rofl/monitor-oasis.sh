#!/bin/bash
# monitor-oasis.sh - Monitor bet-router-rofl on Oasis ROFL
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }

APP_NAME="bet-router-rofl"

echo "🔍 Monitoring $APP_NAME on Oasis ROFL"
echo "======================================="

# Check if Oasis CLI is available
if ! command -v oasis &> /dev/null; then
    echo "❌ Oasis CLI not found. Please install it first."
    exit 1
fi

while true; do
    clear
    echo "🔍 bet-router-rofl Status - $(date)"
    echo "=================================="
    
    # Show app status
    echo "📊 Application Status:"
    if oasis rofl show "$APP_NAME" 2>/dev/null; then
        echo
    else
        echo "❌ Application not found or not deployed"
        echo
    fi
    
    echo "📋 Recent Logs:"
    echo "---------------"
    oasis rofl logs "$APP_NAME" --tail=10 2>/dev/null || echo "No logs available"
    
    echo
    echo "⌨️  Commands:"
    echo "  [r] Refresh  [l] Show logs  [s] Show status  [q] Quit"
    echo -n "Choice: "
    
    # Wait for input with timeout
    if read -t 5 -n 1 choice; then
        case $choice in
            r|R) continue ;;
            l|L) 
                echo
                echo "📋 Full Logs:"
                oasis rofl logs "$APP_NAME" 2>/dev/null || echo "No logs available"
                echo
                read -p "Press Enter to continue..."
                ;;
            s|S)
                echo
                echo "📊 Detailed Status:"
                oasis rofl show "$APP_NAME" 2>/dev/null || echo "Status not available"
                echo
                read -p "Press Enter to continue..."
                ;;
            q|Q) 
                echo
                echo "👋 Goodbye!"
                exit 0
                ;;
        esac
    fi
    
    sleep 1
done
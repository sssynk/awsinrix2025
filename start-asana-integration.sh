#!/bin/bash

# Asana MCP AWS Core Integration Startup Script
# This script starts the complete Asana MCP integration system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo -e "${BLUE}🚀 Starting Asana MCP AWS Core Integration${NC}"
echo "=================================================="
echo "Project Root: $PROJECT_ROOT"
echo "Backend Dir: $BACKEND_DIR"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts - $service_name not ready yet${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo "Please install the missing dependencies and try again."
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites are available${NC}"
}

# Check environment configuration
check_environment() {
    echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
        if [ -f "$PROJECT_ROOT/asana-env.template" ]; then
            cp "$PROJECT_ROOT/asana-env.template" "$PROJECT_ROOT/.env"
            echo -e "${YELLOW}📝 Please edit .env file with your actual configuration values${NC}"
            echo -e "${YELLOW}   Required: ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, DB_PASSWORD${NC}"
        else
            echo -e "${RED}❌ No environment template found${NC}"
            exit 1
        fi
    fi
    
    # Source environment variables
    if [ -f "$PROJECT_ROOT/.env" ]; then
        source "$PROJECT_ROOT/.env"
        echo -e "${GREEN}✅ Environment configuration loaded${NC}"
    else
        echo -e "${RED}❌ Failed to load environment configuration${NC}"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Install backend dependencies
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    cd "$BACKEND_DIR"
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✅ Node.js dependencies already installed${NC}"
    fi
    
    echo -e "${GREEN}✅ All dependencies installed${NC}"
}

# Start backend
start_backend() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    # Check if port is already in use
    if port_in_use 3003; then
        echo -e "${YELLOW}⚠️  Port 3003 is already in use (backend)${NC}"
        echo -e "${YELLOW}   Please stop the existing service or use a different port${NC}"
        exit 1
    fi
    
    # Start backend
    echo -e "${YELLOW}Starting Node.js Backend...${NC}"
    cd "$BACKEND_DIR"
    nohup npm start > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3003/auth" "Backend"; then
        echo -e "${GREEN}✅ Backend started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Backend${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# Show service status
show_status() {
    echo -e "${BLUE}📊 Service Status${NC}"
    echo "=================="
    
    # Check backend
    if curl -s -f "http://localhost:3003/auth" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: Running on http://localhost:3003${NC}"
    else
        echo -e "${RED}❌ Backend: Not responding${NC}"
    fi
    
    # Check Asana auth endpoints
    if curl -s -f "http://localhost:3003/api/asana/auth/status" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Asana Auth: Working${NC}"
    else
        echo -e "${RED}❌ Asana Auth: Not responding${NC}"
    fi
    
    # Check Asana proxy
    if curl -s -f "http://localhost:3003/api/asana/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Asana Proxy: Working${NC}"
    else
        echo -e "${RED}❌ Asana Proxy: Not responding${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔗 Service URLs:${NC}"
    echo "Backend: http://localhost:3003"
    echo "Authentication: http://localhost:3003/auth"
    echo "Asana Login: http://localhost:3003/api/asana/auth/login"
    echo "Asana Status: http://localhost:3003/api/asana/auth/status"
    echo "Asana Health: http://localhost:3003/api/asana/health"
    echo ""
    echo -e "${BLUE}📋 Log Files:${NC}"
    echo "Backend: $BACKEND_DIR/backend.log"
    echo ""
    echo -e "${BLUE}🎯 Next Steps:${NC}"
    echo "1. Register your application with Asana MCP:"
    echo "   curl -X POST https://mcp.asana.com/register \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -d '{\"redirect_uris\": [\"http://localhost:3003/api/asana/callback\"]}'"
    echo ""
    echo "2. Update .env file with your Asana credentials"
    echo "3. Test the integration: ./scripts/test-asana-integration.sh"
    echo "4. Access the application: http://localhost:3003/auth"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "Backend stopped"
    fi
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    check_prerequisites
    check_environment
    install_dependencies
    start_backend
    show_status
    
    echo -e "\n${GREEN}🎉 Asana MCP AWS Core Integration is running!${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Keep script running
    while true; do
        sleep 10
        # Optional: Add health checks here
    done
}

# Help function
show_help() {
    echo "Asana MCP AWS Core Integration Startup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -t, --test     Run integration tests after startup"
    echo "  -s, --status   Show service status only"
    echo ""
    echo "This script will:"
    echo "1. Check prerequisites"
    echo "2. Load environment configuration"
    echo "3. Install dependencies"
    echo "4. Start backend server"
    echo "5. Show service status"
    echo ""
    echo "Prerequisites:"
    echo "- Node.js 18+"
    echo "- npm"
    echo "- curl"
    echo "- PostgreSQL database (optional for analytics)"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--test)
            RUN_TESTS=true
            shift
            ;;
        -s|--status)
            show_status
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main

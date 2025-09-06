#!/bin/bash

# BlogMP Local Development Runner
# Runs the complete application stack without Docker
# Uses SQLite databases for both frontend and backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print usage
usage() {
    echo -e "${BLUE}BlogMP Local Development Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  --skip-deps          Skip dependency installation"
    echo "  --skip-db-setup      Skip database setup"
    echo ""
    echo "This script runs the BlogMP application completely without Docker."
    echo "It uses SQLite databases for both frontend and backend services."
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment
check_environment() {
    echo -e "${BLUE}🔍 Checking environment...${NC}"

    # Check if Node.js is installed
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        echo -e "${YELLOW}   Download from: https://nodejs.org/${NC}"
        exit 1
    fi

    # Check Node.js version (Next.js 15 requires Node 18+)
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18 or higher is required. Current: $(node -v)${NC}"
        exit 1
    fi

    # Check if npm is available
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not available. Please install npm.${NC}"
        exit 1
    fi

    # Check if required directories exist
    if [ ! -d "frontend" ]; then
        echo -e "${RED}❌ frontend directory not found.${NC}"
        exit 1
    fi

    if [ ! -d "backend/ghost-backend" ]; then
        echo -e "${RED}❌ backend/ghost-backend directory not found.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Environment check passed${NC}"
    echo -e "${GREEN}   Node.js: $(node -v)${NC}"
    echo -e "${GREEN}   npm: $(npm -v)${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"

    # Install frontend dependencies
    if [ -f "frontend/package.json" ]; then
        echo -e "${CYAN}Installing frontend dependencies...${NC}"
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi

    # Check if Ghost CLI is available for backend
    if ! command_exists ghost; then
        echo -e "${YELLOW}⚠️  Ghost CLI not found. Installing globally...${NC}"
        npm install -g ghost-cli
        echo -e "${GREEN}✅ Ghost CLI installed${NC}"
    fi
}

# Function to setup databases
setup_databases() {
    echo -e "${BLUE}🗄️  Setting up databases...${NC}"

    # Setup frontend database (Prisma)
    if [ -f "frontend/prisma/schema.prisma" ]; then
        echo -e "${CYAN}Setting up frontend database...${NC}"
        cd frontend
        npx prisma generate
        npx prisma db push
        cd ..
        echo -e "${GREEN}✅ Frontend database ready${NC}"
    fi

    # Backend database is SQLite and should be auto-created by Ghost
    echo -e "${GREEN}✅ Backend database will be created automatically by Ghost${NC}"
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"

    # Start frontend
    echo -e "${CYAN}Starting Next.js frontend...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

    # Start backend
    if [ -d "backend/ghost-backend" ]; then
        echo -e "${CYAN}Starting Ghost CMS backend...${NC}"
        cd backend/ghost-backend
        ghost start &
        BACKEND_PID=$!
        cd ../..
        echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
    fi

    # Wait a moment for services to start
    sleep 3
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Service Status${NC}"
    echo "=================="

    # Check frontend
    if pgrep -f "next dev" >/dev/null; then
        echo -e "${GREEN}✅ Frontend (Next.js) is running${NC}"
    else
        echo -e "${RED}❌ Frontend (Next.js) is not running${NC}"
    fi

    # Check backend
    if pgrep -f "ghost" >/dev/null; then
        echo -e "${GREEN}✅ Backend (Ghost CMS) is running${NC}"
    else
        echo -e "${RED}❌ Backend (Ghost CMS) is not running${NC}"
    fi

    # Check ports
    echo -e "\n${CYAN}Port Status:${NC}"
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port 3000 (Frontend) is open${NC}"
    else
        echo -e "${RED}❌ Port 3000 (Frontend) is closed${NC}"
    fi

    if lsof -Pi :2368 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port 2368 (Ghost CMS) is open${NC}"
    else
        echo -e "${RED}❌ Port 2368 (Ghost CMS) is closed${NC}"
    fi
}

# Function to stop services
stop_services() {
    echo -e "${BLUE}🛑 Stopping services...${NC}"

    # Kill frontend
    if pgrep -f "next dev" >/dev/null; then
        pkill -f "next dev"
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend was not running${NC}"
    fi

    # Kill backend
    if pgrep -f "ghost" >/dev/null; then
        pkill -f "ghost"
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend was not running${NC}"
    fi
}

# Parse command line arguments
SKIP_DEPS=false
SKIP_DB_SETUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-db-setup)
            SKIP_DB_SETUP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Main execution
echo -e "${PURPLE}🚀 BlogMP Local Development Runner${NC}"
echo -e "${PURPLE}Running without Docker - SQLite databases${NC}"
echo "==============================================="

# Check environment
check_environment

# Install dependencies
if [ "$SKIP_DEPS" = false ]; then
    install_dependencies
fi

# Setup databases
if [ "$SKIP_DB_SETUP" = false ]; then
    setup_databases
fi

# Start services
start_services

# Show status
show_status

echo ""
echo -e "${GREEN}🎉 BlogMP is now running locally!${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}👤 Admin Panel: http://localhost:3000/admin${NC}"
if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}👻 Ghost CMS: http://localhost:2368/ghost${NC}"
fi
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo "  $0 --help          # Show help"
echo "  ./run.sh --status  # Check service status"
echo "  ./run.sh --stop    # Stop all services"
echo ""
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop all services${NC}"

# Setup cleanup on script exit
trap 'echo -e "\n${BLUE}Stopping services...${NC}"; stop_services; exit 0' INT

# Keep the script running
wait $FRONTEND_PID 2>/dev/null || true
if [ -n "$BACKEND_PID" ]; then
    wait $BACKEND_PID 2>/dev/null || true
fi

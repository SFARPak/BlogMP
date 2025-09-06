#!/bin/bash

# Quick Development Startup Script for BlogMP
# Simple script to start the development environment quickly

set -e

echo "🚀 Starting BlogMP Development Environment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Please run this script from the BlogMP root directory${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Start database services
echo -e "${BLUE}Starting database services...${NC}"
docker-compose up -d database redis

# Wait for database to be ready
echo -e "${BLUE}Waiting for database to be ready...${NC}"
sleep 10

# Setup database schema
echo -e "${BLUE}Setting up database schema...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
fi

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Go back to root
cd ..

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

# Start backend if available
cd ..
if [ -d "backend/ghost-backend" ]; then
    echo -e "${BLUE}Starting Ghost CMS backend...${NC}"
    cd backend/ghost-backend
    ghost start &
    BACKEND_PID=$!
    cd ../..
fi

echo -e "${GREEN}✅ BlogMP Development Environment Started!${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}👤 Admin Panel: http://localhost:3000/admin${NC}"
if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}👻 Ghost CMS: http://localhost:2368/ghost${NC}"
fi
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo "  ./run.sh --status    # Check service status"
echo "  ./run.sh --logs      # View service logs"
echo "  ./run.sh --stop      # Stop all services"
echo ""
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop all services${NC}"

# Wait for user interrupt
trap 'echo -e "\n${BLUE}Stopping services...${NC}"; ./run.sh --stop; exit 0' INT

# Keep the script running
wait $FRONTEND_PID 2>/dev/null || true
if [ -n "$BACKEND_PID" ]; then
    wait $BACKEND_PID 2>/dev/null || true
fi

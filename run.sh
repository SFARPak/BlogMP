#!/bin/bash

# BlogMP Application Runner
# Comprehensive script to run the blogging platform in development or production mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
MODE="development"
SERVICES="all"
SKIP_CHECKS=false

# Function to print usage
usage() {
    echo -e "${BLUE}BlogMP Application Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE       Run mode: development, production, or test (default: development)"
    echo "  -s, --services SVC    Services to run: frontend, backend, database, all (default: all)"
    echo "  --skip-checks         Skip environment and dependency checks"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all services in development mode"
    echo "  $0 -m production     # Run in production mode"
    echo "  $0 -s frontend       # Run only frontend"
    echo "  $0 -m test           # Run test suite"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment
check_environment() {
    echo -e "${BLUE}🔍 Checking environment...${NC}"

    # Check if Docker is installed
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
        exit 1
    fi

    # Check if Node.js is installed (for development mode)
    if [ "$MODE" = "development" ] && ! command_exists node; then
        echo -e "${YELLOW}⚠️  Node.js is not installed. Development mode may not work properly.${NC}"
    fi

    # Check if required files exist
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ docker-compose.yml not found in current directory.${NC}"
        exit 1
    fi

    if [ ! -d "frontend" ]; then
        echo -e "${RED}❌ frontend directory not found.${NC}"
        exit 1
    fi

    if [ ! -d "backend" ]; then
        echo -e "${RED}❌ backend directory not found.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Environment check passed${NC}"
}

# Function to check environment variables
check_env_vars() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"

    local required_vars=("DATABASE_URL" "NEXTAUTH_SECRET")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Missing environment variables: ${missing_vars[*]}${NC}"
        echo -e "${YELLOW}   Please set them in your .env file or environment${NC}"
    fi

    # Check for optional AI features
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set. AI features will use mock responses.${NC}"
    fi

    echo -e "${GREEN}✅ Environment variables check completed${NC}"
}

# Function to setup development environment
setup_development() {
    echo -e "${BLUE}🚀 Setting up development environment...${NC}"

    # Install frontend dependencies
    if [ -f "frontend/package.json" ]; then
        echo -e "${CYAN}Installing frontend dependencies...${NC}"
        cd frontend
        npm install
        cd ..
    fi

    # Setup database
    if [ -f "frontend/prisma/schema.prisma" ]; then
        echo -e "${CYAN}Setting up database...${NC}"
        cd frontend
        npx prisma generate
        npx prisma db push
        cd ..
    fi

    echo -e "${GREEN}✅ Development environment setup completed${NC}"
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"

    case $MODE in
        "development")
            case $SERVICES in
                "frontend")
                    echo -e "${CYAN}Starting frontend in development mode...${NC}"
                    cd frontend && npm run dev
                    ;;
                "backend")
                    echo -e "${CYAN}Starting backend services...${NC}"
                    docker-compose up -d database redis
                    ;;
                "all")
                    echo -e "${CYAN}Starting all services in development mode...${NC}"
                    # Start database and redis first
                    docker-compose up -d database redis
                    sleep 5
                    # Start frontend
                    cd frontend && npm run dev &
                    FRONTEND_PID=$!
                    # Start backend if available
                    if [ -d "backend/ghost-backend" ]; then
                        cd ../backend/ghost-backend && ghost start &
                        BACKEND_PID=$!
                    fi
                    # Wait for processes
                    wait $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
                    ;;
            esac
            ;;
        "production")
            echo -e "${CYAN}Starting services in production mode...${NC}"
            docker-compose up -d
            echo -e "${GREEN}✅ Services started successfully${NC}"
            echo -e "${YELLOW}🌐 Frontend: http://localhost:3000${NC}"
            echo -e "${YELLOW}👤 Admin: http://localhost:3000/admin${NC}"
            ;;
        "test")
            echo -e "${CYAN}Running test suite...${NC}"
            if [ -f "test-all-phases.sh" ]; then
                chmod +x test-all-phases.sh
                ./test-all-phases.sh
            else
                echo -e "${RED}❌ Test script not found${NC}"
                exit 1
            fi
            ;;
    esac
}

# Function to stop services
stop_services() {
    echo -e "${BLUE}🛑 Stopping services...${NC}"

    case $MODE in
        "development")
            # Kill any running processes
            pkill -f "next dev" || true
            pkill -f "ghost" || true
            ;;
        "production")
            docker-compose down
            ;;
    esac

    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Service Status${NC}"
    echo "=================="

    # Check Docker services
    if command_exists docker && command_exists docker-compose; then
        echo -e "${CYAN}Docker Services:${NC}"
        docker-compose ps
    fi

    # Check development processes
    echo -e "\n${CYAN}Development Processes:${NC}"
    if pgrep -f "next dev" >/dev/null; then
        echo -e "${GREEN}✅ Frontend (Next.js) is running${NC}"
    else
        echo -e "${RED}❌ Frontend (Next.js) is not running${NC}"
    fi

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

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Service Logs${NC}"
    echo "==============="

    case $SERVICES in
        "frontend")
            if [ -f "frontend/.next/development.log" ]; then
                tail -f frontend/.next/development.log
            else
                echo -e "${YELLOW}No frontend logs available${NC}"
            fi
            ;;
        "backend")
            docker-compose logs -f ghost-backend
            ;;
        "database")
            docker-compose logs -f database
            ;;
        "all")
            docker-compose logs -f
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -s|--services)
            SERVICES="$2"
            shift 2
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        --status)
            show_status
            exit 0
            ;;
        --logs)
            show_logs
            exit 0
            ;;
        --stop)
            stop_services
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Validate mode
case $MODE in
    development|production|test)
        ;;
    *)
        echo -e "${RED}Invalid mode: $MODE${NC}"
        usage
        exit 1
        ;;
esac

# Validate services
case $SERVICES in
    frontend|backend|database|all)
        ;;
    *)
        echo -e "${RED}Invalid services: $SERVICES${NC}"
        usage
        exit 1
        ;;
esac

# Main execution
echo -e "${PURPLE}🚀 BlogMP Application Runner${NC}"
echo -e "${PURPLE}Mode: $MODE | Services: $SERVICES${NC}"
echo "=================================="

# Run checks
if [ "$SKIP_CHECKS" = false ]; then
    check_environment
    check_env_vars
fi

# Setup environment
if [ "$MODE" = "development" ]; then
    setup_development
fi

# Start services
start_services

echo -e "\n${GREEN}🎉 BlogMP is now running!${NC}"
echo -e "${YELLOW}📖 Useful commands:${NC}"
echo "  $0 --status    # Check service status"
echo "  $0 --logs      # View service logs"
echo "  $0 --stop      # Stop all services"
echo "  $0 -h          # Show help"

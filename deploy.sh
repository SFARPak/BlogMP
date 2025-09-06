#!/bin/bash

# Dev.to Clone Deployment Script
# This script handles the complete deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="devto-clone"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file ($ENV_FILE) not found."
        log_info "Please copy .env.production and update with your production values."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."

    # Create necessary directories
    mkdir -p nginx/ssl
    mkdir -p database
    mkdir -p logs

    # Copy environment file
    cp "$ENV_FILE" .env

    log_success "Environment setup completed"
}

# Build and deploy
deploy() {
    log_info "Starting deployment..."

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down || true

    # Remove old images (optional)
    log_info "Cleaning up old images..."
    docker image prune -f || true

    # Build and start services
    log_info "Building and starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check service health
    check_health

    log_success "Deployment completed successfully"
}

# Check service health
check_health() {
    log_info "Checking service health..."

    # Check if frontend is responding
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log_success "Frontend service is healthy"
    else
        log_warning "Frontend service health check failed"
    fi

    # Check if database is responding
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database pg_isready -U "${DB_USER:-postgres}" -d devto_clone &> /dev/null; then
        log_success "Database service is healthy"
    else
        log_warning "Database service health check failed"
    fi

    # Check if Redis is responding
    if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping | grep -q PONG; then
        log_success "Redis service is healthy"
    else
        log_warning "Redis service health check failed"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    # Generate Prisma client
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec frontend npx prisma generate

    # Run migrations
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec frontend npx prisma db push

    log_success "Database migrations completed"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."

    # This would typically use certbot for Let's Encrypt
    # For now, we'll just create a placeholder
    log_warning "SSL setup requires manual configuration with your domain"
    log_info "Please run: docker-compose -f $DOCKER_COMPOSE_FILE exec certbot certbot --nginx"
}

# Backup database
backup_database() {
    log_info "Creating database backup..."

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="backup_$TIMESTAMP.sql"

    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database pg_dump -U "${DB_USER:-postgres}" devto_clone > "backups/$BACKUP_FILE"

    log_success "Database backup created: backups/$BACKUP_FILE"
}

# Show logs
show_logs() {
    log_info "Showing service logs..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
}

# Main deployment process
main() {
    echo "🚀 Dev.to Clone Deployment Script"
    echo "================================="

    case "${1:-deploy}" in
        "check")
            check_prerequisites
            ;;
        "setup")
            check_prerequisites
            setup_environment
            ;;
        "deploy")
            check_prerequisites
            setup_environment
            deploy
            run_migrations
            ;;
        "migrate")
            run_migrations
            ;;
        "ssl")
            setup_ssl
            ;;
        "backup")
            backup_database
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            log_info "Stopping services..."
            docker-compose -f "$DOCKER_COMPOSE_FILE" down
            log_success "Services stopped"
            ;;
        "restart")
            log_info "Restarting services..."
            docker-compose -f "$DOCKER_COMPOSE_FILE" restart
            log_success "Services restarted"
            ;;
        *)
            echo "Usage: $0 {check|setup|deploy|migrate|ssl|backup|logs|stop|restart}"
            echo ""
            echo "Commands:"
            echo "  check    - Check prerequisites"
            echo "  setup    - Setup environment"
            echo "  deploy   - Full deployment (default)"
            echo "  migrate  - Run database migrations"
            echo "  ssl      - Setup SSL certificates"
            echo "  backup   - Create database backup"
            echo "  logs     - Show service logs"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

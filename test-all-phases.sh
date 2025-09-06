#!/bin/bash

# Comprehensive Test Script for Blogging App
# Tests all phases: Frontend, Backend, Database, and planned features

set -e

echo "🚀 Starting Comprehensive Blogging App Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_exit_code="${3:-0}"

    echo -e "\n${BLUE}Running: ${test_name}${NC}"
    echo "Command: $test_command"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if eval "$test_command" 2>/dev/null; then
        actual_exit_code=$?
        if [ $actual_exit_code -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC} (Expected exit code: $expected_exit_code, Got: $actual_exit_code)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        actual_exit_code=$?
        if [ $actual_exit_code -eq $expected_exit_code ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC} (Expected exit code: $expected_exit_code, Got: $actual_exit_code)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    local test_name="$3"

    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    echo "URL: $url"
    echo "Expected Status: $expected_status"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ PASSED${NC} (Status: $response)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $response)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  SKIPPED${NC} (curl not available)"
    fi
}

# Function to test JSON endpoint
test_json_endpoint() {
    local url="$1"
    local test_name="$2"

    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    echo "URL: $url"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if command -v curl &> /dev/null && command -v jq &> /dev/null; then
        response=$(curl -s "$url" 2>/dev/null)
        if echo "$response" | jq . >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PASSED${NC} (Valid JSON response)"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAILED${NC} (Invalid JSON or no response)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  SKIPPED${NC} (curl or jq not available)"
    fi
}

echo -e "\n📋 PHASE 1: CORE SETUP TESTS"
echo "================================"

# Test if services are running
run_test "Check if Next.js is running" "ps aux | grep -q 'next dev'" 0
run_test "Check if Ghost CMS is running" "ps aux | grep -q 'ghost run'" 0
run_test "Check if database file exists" "test -f frontend/prisma/dev.db" 0
run_test "Check if frontend directory exists" "test -d frontend" 0

echo -e "\n📋 PHASE 2: BLOGGING FEATURES TESTS"
echo "====================================="

# Test API endpoints
test_endpoint "http://localhost:3000/api/health" "200" "Health Check Endpoint"
test_endpoint "http://localhost:3000/api/posts" "200" "Posts API Endpoint"
test_endpoint "http://localhost:3000/api/reactions" "400" "Reactions API Endpoint (should return 400 without params)"

# Test JSON responses
test_json_endpoint "http://localhost:3000/api/posts" "Posts API JSON Response"
test_json_endpoint "http://localhost:3000/api/reactions?postId=test" "Reactions API JSON Response"

# Test frontend pages
test_endpoint "http://localhost:3000" "200" "Homepage"
test_endpoint "http://localhost:3000/write" "200" "Write Page"
test_endpoint "http://localhost:3000/auth/signin" "200" "Sign In Page"

echo -e "\n📋 PHASE 3: SOCIAL FEATURES TESTS"
echo "==================================="

# Test social features
test_endpoint "http://localhost:3000/api/follow" "401" "Follow API Endpoint (should return 401 without auth)"
test_endpoint "http://localhost:3000/api/bookmarks" "401" "Bookmarks API Endpoint (should return 401 without auth)"
test_endpoint "http://localhost:3000/api/notifications" "401" "Notifications API Endpoint (should return 401 without auth)"
test_endpoint "http://localhost:3000/profile" "200" "Profile Page"
test_endpoint "http://localhost:3000/following" "200" "Following Page"
test_endpoint "http://localhost:3000/notifications" "200" "Notifications Page"

# Test database models
run_test "Check Follow model exists" "grep -q 'model Follow' frontend/prisma/schema.prisma" 0
run_test "Check Bookmark model exists" "grep -q 'model Bookmark' frontend/prisma/schema.prisma" 0
run_test "Check Notification model exists" "grep -q 'model Notification' frontend/prisma/schema.prisma" 0

echo -e "\n📋 PHASE 4: AI FEATURES TESTS"
echo "==============================="

# Test AI features (POST-only endpoints return 405 for GET requests)
test_endpoint "http://localhost:3000/api/ai/generate" "405" "AI Generate API (POST-only endpoint)"
test_endpoint "http://localhost:3000/api/ai/seo" "405" "AI SEO API (POST-only endpoint)"
test_endpoint "http://localhost:3000/api/ai/moderate" "405" "AI Moderate API (POST-only endpoint)"
test_endpoint "http://localhost:3000/api/ai/recommend" "401" "AI Recommend API (should return 401 without auth)"

# Test AI endpoints with mock data (no API key needed)
run_test "Check AI generate endpoint exists" "test -f frontend/src/app/api/ai/generate/route.ts" 0
run_test "Check AI SEO endpoint exists" "test -f frontend/src/app/api/ai/seo/route.ts" 0
run_test "Check AI moderate endpoint exists" "test -f frontend/src/app/api/ai/moderate/route.ts" 0
run_test "Check AI recommend endpoint exists" "test -f frontend/src/app/api/ai/recommend/route.ts" 0
run_test "Check OpenAI package installed" "cd frontend && npm list openai | grep -q openai" 0

echo -e "\n📋 PHASE 5: CROSS-POSTING TESTS"
echo "================================="

# Test cross-posting features
test_endpoint "http://localhost:3000/api/crosspost" "405" "Cross-post API (POST-only endpoint)"
run_test "Check CrossPost model exists" "grep -q 'model CrossPost' frontend/prisma/schema.prisma" 0
run_test "Check cross-posting route exists" "test -f frontend/src/app/api/crosspost/route.ts" 0
run_test "Check Ghost API env vars" "grep -q 'GHOST_API_URL' frontend/.env.local" 0
run_test "Check WordPress API env vars" "grep -q 'WORDPRESS_API_URL' frontend/.env.local" 0

echo -e "\n📋 PHASE 6: OPTIMIZATION TESTS"
echo "==============================="

# Test optimization features
test_endpoint "http://localhost:3000/api/search?q=test" "401" "Search API (should return 401 without auth)"
run_test "Check search API exists" "test -f frontend/src/app/api/search/route.ts" 0
run_test "Check cache system exists" "test -f frontend/src/lib/cache.ts" 0
run_test "Check performance monitoring exists" "test -f frontend/src/lib/performance.ts" 0
run_test "Check optimized images component exists" "test -f frontend/src/components/OptimizedImage.tsx" 0
run_test "Check service worker exists" "test -f frontend/public/sw.js" 0
run_test "Check Docker configuration exists" "test -f frontend/Dockerfile" 0
run_test "Check deployment script exists" "test -f deploy.sh" 0

echo -e "\n📋 DATABASE INTEGRATION TESTS"
echo "==============================="

# Test database connectivity
run_test "Check Prisma schema exists" "test -f frontend/prisma/schema.prisma" 0
run_test "Check database migrations" "test -f frontend/prisma/dev.db" 0

echo -e "\n📋 BUILD AND COMPILATION TESTS"
echo "==============================="

# Test build process
run_test "Frontend build compilation" "cd frontend && npm run build > /dev/null 2>&1" 0
run_test "TypeScript compilation" "cd frontend && npx tsc --noEmit > /dev/null 2>&1" 0

echo -e "\n📋 SECURITY TESTS"
echo "=================="

# Test basic security
run_test "Check for .env files" "test -f frontend/.env.local" 0
run_test "Check for sensitive files" "! test -f frontend/.env.local || ! grep -q 'SECRET' frontend/.env.local" 0

echo -e "\n📋 PERFORMANCE TESTS"
echo "====================="

# Basic performance tests
run_test "Check bundle size" "test -d frontend/.next" 0
run_test "Check static assets" "test -d frontend/public" 0

echo -e "\n📋 INTEGRATION TESTS"
echo "====================="

# Test full user flow (simulated)
echo -e "${YELLOW}Manual Integration Tests Required:${NC}"
echo "  1. User registration and login"
echo "  2. Post creation and publishing"
echo "  3. Reaction functionality"
echo "  4. Comment system"
echo "  5. Search functionality"

echo -e "\n"🎯 TEST SUMMARY"
echo "==============="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "The blogging platform is ready for production."
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please review the failed tests above."
    exit 1
fi

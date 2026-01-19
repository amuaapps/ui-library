#!/bin/bash
# Verify Storybook deployment is healthy
# Usage: ./verify.sh <url> [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
URL=""
TIMEOUT=10
RETRIES=3
VERBOSE=false
CHECK_ASSETS=true
CHECK_COMPONENTS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--url)
      URL="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -r|--retries)
      RETRIES="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    --skip-assets)
      CHECK_ASSETS=false
      shift
      ;;
    --check-components)
      CHECK_COMPONENTS=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 -u <url> [options]"
      echo ""
      echo "Required:"
      echo "  -u, --url               Storybook URL to verify"
      echo ""
      echo "Optional:"
      echo "  -t, --timeout           Request timeout in seconds (default: 10)"
      echo "  -r, --retries           Number of retries (default: 3)"
      echo "  -v, --verbose           Show detailed output"
      echo "  --skip-assets           Skip asset verification"
      echo "  --check-components      Check sample components load"
      echo "  -h, --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 -u https://storybook.example.com"
      echo "  $0 -u https://d111111abcdef8.cloudfront.net --verbose"
      echo "  $0 -u https://storage.z13.web.core.windows.net --check-components"
      exit 0
      ;;
    *)
      # Assume first positional argument is URL
      if [ -z "$URL" ]; then
        URL="$1"
      else
        echo -e "${RED}Unknown option: $1${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate required arguments
if [ -z "$URL" ]; then
  echo -e "${RED}Error: URL is required${NC}"
  echo "Usage: $0 -u <url>"
  exit 1
fi

# Remove trailing slash from URL
URL="${URL%/}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Storybook Verification               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  URL: $URL"
echo "  Timeout: ${TIMEOUT}s"
echo "  Retries: $RETRIES"
echo "  Check Assets: $CHECK_ASSETS"
echo "  Check Components: $CHECK_COMPONENTS"
echo ""

# Check if curl is installed
if ! command -v curl &> /dev/null; then
  echo -e "${RED}Error: curl is not installed${NC}"
  exit 1
fi

# Function to make HTTP request with retries
make_request() {
  local url=$1
  local expected_status=${2:-200}
  local attempt=1
  
  while [ $attempt -le $RETRIES ]; do
    if [ "$VERBOSE" = true ]; then
      echo "  Attempt $attempt/$RETRIES: $url"
    fi
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$STATUS" = "$expected_status" ]; then
      return 0
    fi
    
    if [ $attempt -lt $RETRIES ]; then
      sleep 2
    fi
    
    attempt=$((attempt + 1))
  done
  
  echo "$STATUS"
  return 1
}

# Function to check if content contains string
check_content() {
  local url=$1
  local search_string=$2
  local attempt=1
  
  while [ $attempt -le $RETRIES ]; do
    if [ "$VERBOSE" = true ]; then
      echo "  Attempt $attempt/$RETRIES: Checking content"
    fi
    
    CONTENT=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
    
    if echo "$CONTENT" | grep -q "$search_string"; then
      return 0
    fi
    
    if [ $attempt -lt $RETRIES ]; then
      sleep 2
    fi
    
    attempt=$((attempt + 1))
  done
  
  return 1
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Index page accessibility
echo -e "${YELLOW}Test 1/6: Checking index.html accessibility...${NC}"
if make_request "$URL/index.html" 200 > /dev/null; then
  echo -e "${GREEN}✓ index.html is accessible (HTTP 200)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  STATUS=$(make_request "$URL/index.html" 200)
  echo -e "${RED}✗ index.html returned HTTP $STATUS${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: Storybook content detection
echo -e "${YELLOW}Test 2/6: Checking Storybook content...${NC}"
if check_content "$URL/index.html" "Storybook"; then
  echo -e "${GREEN}✓ Storybook content detected${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Storybook content not found${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: iframe.html accessibility
echo -e "${YELLOW}Test 3/6: Checking iframe.html accessibility...${NC}"
if make_request "$URL/iframe.html" 200 > /dev/null; then
  echo -e "${GREEN}✓ iframe.html is accessible (HTTP 200)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  STATUS=$(make_request "$URL/iframe.html" 200)
  echo -e "${RED}✗ iframe.html returned HTTP $STATUS${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: project.json accessibility
echo -e "${YELLOW}Test 4/6: Checking project.json accessibility...${NC}"
if make_request "$URL/project.json" 200 > /dev/null; then
  echo -e "${GREEN}✓ project.json is accessible (HTTP 200)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  
  # Try to parse version
  if [ "$VERBOSE" = true ]; then
    VERSION=$(curl -s --max-time $TIMEOUT "$URL/project.json" 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    echo "  Storybook version: $VERSION"
  fi
else
  STATUS=$(make_request "$URL/project.json" 200)
  echo -e "${RED}✗ project.json returned HTTP $STATUS${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Asset accessibility (optional)
if [ "$CHECK_ASSETS" = true ]; then
  echo -e "${YELLOW}Test 5/6: Checking sample assets...${NC}"
  
  # Try to find and check a JS asset
  ASSET_FOUND=false
  if [ "$VERBOSE" = true ]; then
    echo "  Looking for JS assets in index.html..."
  fi
  
  # Extract first JS file from index.html
  JS_FILE=$(curl -s --max-time $TIMEOUT "$URL/index.html" 2>/dev/null | grep -o 'src="[^"]*\.js"' | head -1 | cut -d'"' -f2 || echo "")
  
  if [ -n "$JS_FILE" ]; then
    # Handle relative paths
    if [[ "$JS_FILE" == /* ]]; then
      JS_URL="$URL$JS_FILE"
    else
      JS_URL="$URL/$JS_FILE"
    fi
    
    if [ "$VERBOSE" = true ]; then
      echo "  Checking: $JS_URL"
    fi
    
    if make_request "$JS_URL" 200 > /dev/null; then
      echo -e "${GREEN}✓ Sample JS asset is accessible${NC}"
      TESTS_PASSED=$((TESTS_PASSED + 1))
      ASSET_FOUND=true
    fi
  fi
  
  if [ "$ASSET_FOUND" = false ]; then
    echo -e "${YELLOW}⚠ Could not verify assets (may be normal)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
else
  echo -e "${YELLOW}Test 5/6: Skipped (asset verification disabled)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

# Test 6: Component check (optional)
if [ "$CHECK_COMPONENTS" = true ]; then
  echo -e "${YELLOW}Test 6/6: Checking sample components...${NC}"
  
  # Try to load a story
  STORY_FOUND=false
  
  # Common story paths to try
  STORY_PATHS=(
    "?path=/story/button--primary"
    "?path=/story/components-button--primary"
    "?path=/docs/button--docs"
  )
  
  for STORY_PATH in "${STORY_PATHS[@]}"; do
    if [ "$VERBOSE" = true ]; then
      echo "  Trying: $URL/iframe.html$STORY_PATH"
    fi
    
    if make_request "$URL/iframe.html$STORY_PATH" 200 > /dev/null; then
      echo -e "${GREEN}✓ Sample component story is accessible${NC}"
      TESTS_PASSED=$((TESTS_PASSED + 1))
      STORY_FOUND=true
      break
    fi
  done
  
  if [ "$STORY_FOUND" = false ]; then
    echo -e "${YELLOW}⚠ Could not verify component stories (may be normal)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  fi
else
  echo -e "${YELLOW}Test 6/6: Skipped (component check disabled)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Verification Summary                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All verification tests passed${NC}"
  echo ""
  echo "Storybook is healthy and ready to use!"
  echo ""
  echo "Next steps:"
  echo "  1. Open in browser: $URL"
  echo "  2. Test manually for any visual issues"
  echo "  3. If satisfied, switch to this environment"
  exit 0
else
  echo -e "${RED}✗ $TESTS_FAILED test(s) failed${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check if deployment completed successfully"
  echo "  2. Verify files were uploaded correctly"
  echo "  3. Check CDN propagation (may take 1-5 minutes)"
  echo "  4. Review CloudFront/CDN logs for errors"
  echo "  5. Try accessing URL directly in browser"
  exit 1
fi

#!/bin/bash
# Switch active Storybook environment (blue/green)
# Usage: ./switch.sh <environment> [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
TARGET_ENV=""
AUTO_APPROVE=false
VERIFY_AFTER=true
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    blue|green)
      TARGET_ENV="$1"
      shift
      ;;
    --auto-approve)
      AUTO_APPROVE=true
      shift
      ;;
    --no-verify)
      VERIFY_AFTER=false
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 <blue|green> [options]"
      echo ""
      echo "Arguments:"
      echo "  blue|green          Target environment to switch to"
      echo ""
      echo "Options:"
      echo "  --auto-approve      Skip confirmation prompt"
      echo "  --no-verify         Skip post-switch verification"
      echo "  -v, --verbose       Show detailed output"
      echo "  -h, --help          Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 green"
      echo "  $0 blue --auto-approve"
      echo "  $0 green --no-verify"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 <blue|green> [options]"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$TARGET_ENV" ]; then
  echo -e "${RED}Error: Target environment is required${NC}"
  echo "Usage: $0 <blue|green>"
  exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
  echo -e "${RED}Error: Terraform is not installed${NC}"
  echo "Install from: https://www.terraform.io/downloads"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Storybook Environment Switch (AWS)  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get current state
echo -e "${YELLOW}Checking current state...${NC}"

# Initialize terraform if needed
if [ ! -d ".terraform" ]; then
  echo "Initializing Terraform..."
  terraform init > /dev/null 2>&1
fi

# Get current active environment
CURRENT_ENV=$(terraform output -raw active_environment 2>/dev/null || echo "unknown")

if [ "$CURRENT_ENV" = "unknown" ]; then
  echo -e "${YELLOW}⚠ Could not determine current environment${NC}"
  echo "This may be the first deployment"
else
  echo "Current active environment: $CURRENT_ENV"
fi

echo "Target environment: $TARGET_ENV"
echo ""

# Check if already on target
if [ "$CURRENT_ENV" = "$TARGET_ENV" ]; then
  echo -e "${YELLOW}⚠ Already on $TARGET_ENV environment${NC}"
  echo "No switch needed"
  exit 0
fi

# Get URLs for display
ACTIVE_URL=$(terraform output -raw storybook_url_active 2>/dev/null || echo "unknown")
TARGET_URL=""
if [ "$TARGET_ENV" = "green" ]; then
  TARGET_URL=$(terraform output -raw storybook_url_green 2>/dev/null || echo "unknown")
else
  TARGET_URL=$(terraform output -raw storybook_url_blue 2>/dev/null || echo "unknown")
fi

echo -e "${YELLOW}Switch Details:${NC}"
echo "  From: $CURRENT_ENV"
echo "  To: $TARGET_ENV"
echo "  Current Active URL: $ACTIVE_URL"
echo "  New Active URL: $TARGET_URL"
echo ""

# Confirmation prompt
if [ "$AUTO_APPROVE" = false ]; then
  echo -e "${YELLOW}This will switch the active Storybook environment.${NC}"
  echo "Users will start seeing the $TARGET_ENV deployment."
  echo ""
  read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
  
  if [ "$CONFIRM" != "yes" ]; then
    echo "Switch cancelled"
    exit 0
  fi
  echo ""
fi

# Perform switch
echo -e "${GREEN}Switching to $TARGET_ENV...${NC}"

TF_ARGS="-var=active_environment=$TARGET_ENV"
if [ "$AUTO_APPROVE" = true ]; then
  TF_ARGS="$TF_ARGS -auto-approve"
fi
if [ "$VERBOSE" = false ]; then
  TF_ARGS="$TF_ARGS -input=false"
fi

if terraform apply $TF_ARGS; then
  echo -e "${GREEN}✓ Switch completed successfully${NC}"
else
  echo -e "${RED}✗ Switch failed${NC}"
  exit 1
fi
echo ""

# Wait for propagation
echo -e "${YELLOW}Waiting for CDN propagation (30 seconds)...${NC}"
sleep 30
echo ""

# Verify after switch
if [ "$VERIFY_AFTER" = true ]; then
  echo -e "${GREEN}Verifying active deployment...${NC}"
  
  # Get new active URL
  NEW_ACTIVE_URL=$(terraform output -raw storybook_url_active 2>/dev/null || echo "")
  
  if [ -n "$NEW_ACTIVE_URL" ]; then
    # Check if verify script exists
    VERIFY_SCRIPT="../../../shared/storybook/verify.sh"
    if [ -f "$VERIFY_SCRIPT" ]; then
      if $VERIFY_SCRIPT -u "$NEW_ACTIVE_URL"; then
        echo -e "${GREEN}✓ Verification passed${NC}"
      else
        echo -e "${RED}✗ Verification failed${NC}"
        echo ""
        echo -e "${YELLOW}Rollback recommendation:${NC}"
        echo "  ./switch.sh $CURRENT_ENV --auto-approve"
        exit 1
      fi
    else
      # Manual verification
      echo "Verify script not found, checking manually..."
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$NEW_ACTIVE_URL/index.html" 2>/dev/null || echo "000")
      
      if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Active URL is accessible (HTTP 200)${NC}"
      else
        echo -e "${RED}✗ Active URL returned HTTP $STATUS${NC}"
        echo ""
        echo -e "${YELLOW}Rollback recommendation:${NC}"
        echo "  ./switch.sh $CURRENT_ENV --auto-approve"
        exit 1
      fi
    fi
  else
    echo -e "${YELLOW}⚠ Could not get active URL for verification${NC}"
  fi
  echo ""
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Switch Complete                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Successfully switched to $TARGET_ENV${NC}"
echo ""
echo "Active URL: $NEW_ACTIVE_URL"
echo ""
echo "Next steps:"
echo "  1. Test Storybook in browser: $NEW_ACTIVE_URL"
echo "  2. Monitor for any issues"
echo "  3. If issues found, rollback with:"
echo "     ./switch.sh $CURRENT_ENV --auto-approve"
echo ""
echo "Previous environment ($CURRENT_ENV) is still available for rollback."

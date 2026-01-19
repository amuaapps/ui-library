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
RESOURCE_GROUP=""
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
    -g|--resource-group)
      RESOURCE_GROUP="$2"
      shift 2
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
      echo "Usage: $0 <blue|green> -g <resource-group> [options]"
      echo ""
      echo "Arguments:"
      echo "  blue|green              Target environment to switch to"
      echo ""
      echo "Required:"
      echo "  -g, --resource-group    Azure resource group name"
      echo ""
      echo "Options:"
      echo "  --auto-approve          Skip confirmation prompt"
      echo "  --no-verify             Skip post-switch verification"
      echo "  -v, --verbose           Show detailed output"
      echo "  -h, --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 green -g rg-ui-library-prod"
      echo "  $0 blue -g rg-ui-library-prod --auto-approve"
      echo "  $0 green -g rg-ui-library-prod --no-verify"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 <blue|green> -g <resource-group> [options]"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$TARGET_ENV" ]; then
  echo -e "${RED}Error: Target environment is required${NC}"
  echo "Usage: $0 <blue|green> -g <resource-group>"
  exit 1
fi

if [ -z "$RESOURCE_GROUP" ]; then
  echo -e "${RED}Error: Resource group is required${NC}"
  echo "Usage: $0 <blue|green> -g <resource-group>"
  exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  echo -e "${RED}Error: Azure CLI is not installed${NC}"
  echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
  exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
  echo -e "${RED}Error: Not logged in to Azure${NC}"
  echo "Run 'az login' first"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Storybook Environment Switch (Azure)║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get current state
echo -e "${YELLOW}Checking current state...${NC}"

# Get current active environment
CURRENT_ENV=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name main \
  --query 'properties.outputs.activeEnvironment.value' \
  --output tsv 2>/dev/null || echo "unknown")

if [ "$CURRENT_ENV" = "unknown" ] || [ -z "$CURRENT_ENV" ]; then
  echo -e "${YELLOW}⚠ Could not determine current environment${NC}"
  echo "This may be the first deployment"
  CURRENT_ENV="unknown"
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
ACTIVE_URL=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name main \
  --query 'properties.outputs.storybookUrlActive.value' \
  --output tsv 2>/dev/null || echo "unknown")

TARGET_URL=""
if [ "$TARGET_ENV" = "green" ]; then
  TARGET_URL=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name main \
    --query 'properties.outputs.storybookUrlGreen.value' \
    --output tsv 2>/dev/null || echo "unknown")
else
  TARGET_URL=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name main \
    --query 'properties.outputs.storybookUrlBlue.value' \
    --output tsv 2>/dev/null || echo "unknown")
fi

echo -e "${YELLOW}Switch Details:${NC}"
echo "  From: $CURRENT_ENV"
echo "  To: $TARGET_ENV"
echo "  Resource Group: $RESOURCE_GROUP"
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

# Check if parameters.json exists
if [ ! -f "parameters.json" ]; then
  echo -e "${RED}Error: parameters.json not found${NC}"
  echo "Create parameters.json from parameters.example.json"
  exit 1
fi

# Deploy with new active environment
DEPLOY_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment="$TARGET_ENV" \
  --output json 2>&1)

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Switch completed successfully${NC}"
else
  echo -e "${RED}✗ Switch failed${NC}"
  if [ "$VERBOSE" = true ]; then
    echo "$DEPLOY_OUTPUT"
  fi
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
  NEW_ACTIVE_URL=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name main \
    --query 'properties.outputs.storybookUrlActive.value' \
    --output tsv 2>/dev/null || echo "")
  
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
        echo "  ./switch.sh $CURRENT_ENV -g $RESOURCE_GROUP --auto-approve"
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
        echo "  ./switch.sh $CURRENT_ENV -g $RESOURCE_GROUP --auto-approve"
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
echo "     ./switch.sh $CURRENT_ENV -g $RESOURCE_GROUP --auto-approve"
echo ""
echo "Previous environment ($CURRENT_ENV) is still available for rollback."

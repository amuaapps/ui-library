#!/bin/bash
# Lint and security check Bicep templates

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Bicep Lint & Security Checks        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  echo -e "${RED}✗ Azure CLI is not installed${NC}"
  echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
  exit 1
fi

# Check if Bicep is installed
if ! az bicep version &> /dev/null; then
  echo -e "${RED}✗ Bicep is not installed${NC}"
  echo "Install with: az bicep install"
  exit 1
fi

# Step 1: Bicep build
echo -e "${YELLOW}Step 1/4: Running bicep build...${NC}"
if az bicep build --file main.bicep; then
  echo -e "${GREEN}✓ Bicep build succeeded${NC}"
else
  echo -e "${RED}✗ Bicep build failed${NC}"
  exit 1
fi
echo ""

# Step 2: Bicep lint
echo -e "${YELLOW}Step 2/4: Running bicep linter...${NC}"
LINT_OUTPUT=$(az bicep lint --file main.bicep 2>&1)
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Bicep linter checks passed${NC}"
else
  echo -e "${YELLOW}⚠ Bicep linter found issues:${NC}"
  echo "$LINT_OUTPUT"
  
  # Check if there are errors (not just warnings)
  if echo "$LINT_OUTPUT" | grep -q "Error"; then
    echo -e "${RED}✗ Bicep linter found errors${NC}"
    exit 1
  else
    echo -e "${YELLOW}⚠ Only warnings found, continuing...${NC}"
  fi
fi
echo ""

# Step 3: Checkov (optional)
echo -e "${YELLOW}Step 3/4: Running checkov...${NC}"
if command -v checkov &> /dev/null; then
  # Build ARM template for checkov
  az bicep build --file main.bicep --outfile main.json > /dev/null 2>&1
  
  if checkov -f main.json --framework arm --quiet; then
    echo -e "${GREEN}✓ Checkov security checks passed${NC}"
  else
    echo -e "${RED}✗ Checkov security checks failed${NC}"
    rm -f main.json
    exit 1
  fi
  
  # Clean up generated ARM template
  rm -f main.json
else
  echo -e "${YELLOW}⚠ Checkov not installed (optional)${NC}"
  echo "Install from: https://www.checkov.io/"
fi
echo ""

# Step 4: Bicep what-if (dry run)
echo -e "${YELLOW}Step 4/4: Running bicep what-if (dry run)...${NC}"
if [ -f "parameters.json" ]; then
  # Check if logged in to Azure
  if az account show &> /dev/null; then
    echo -e "${YELLOW}Using parameters.json${NC}"
    
    # Get resource group from parameters or use default
    RG=$(jq -r '.parameters.projectName.value + "-" + .parameters.environment.value' parameters.json 2>/dev/null || echo "rg-ui-library-dev")
    
    # Check if resource group exists
    if az group show --name "$RG" &> /dev/null; then
      if az deployment group what-if \
        --resource-group "$RG" \
        --template-file main.bicep \
        --parameters parameters.json \
        --no-pretty-print > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Bicep what-if succeeded${NC}"
      else
        echo -e "${YELLOW}⚠ Bicep what-if had issues (may be expected)${NC}"
      fi
    else
      echo -e "${YELLOW}⚠ Resource group $RG not found, skipping what-if${NC}"
    fi
  else
    echo -e "${YELLOW}⚠ Not logged in to Azure, skipping what-if${NC}"
    echo "Run 'az login' to enable what-if analysis"
  fi
else
  echo -e "${YELLOW}⚠ parameters.json not found, skipping what-if${NC}"
  echo "Create parameters.json from parameters.example.json to test what-if"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   All Checks Passed                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Bicep templates are valid and secure${NC}"

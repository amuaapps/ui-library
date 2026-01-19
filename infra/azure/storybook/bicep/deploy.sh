#!/bin/bash
# Deployment script for Azure Bicep template

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
RESOURCE_GROUP=""
PARAMETERS_FILE="parameters.json"
DEPLOYMENT_NAME="storybook-$(date +%Y%m%d-%H%M%S)"
WHAT_IF=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -g|--resource-group)
      RESOURCE_GROUP="$2"
      shift 2
      ;;
    -p|--parameters)
      PARAMETERS_FILE="$2"
      shift 2
      ;;
    -n|--name)
      DEPLOYMENT_NAME="$2"
      shift 2
      ;;
    --what-if)
      WHAT_IF=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 -g <resource-group> [-p <parameters-file>] [-n <deployment-name>] [--what-if]"
      echo ""
      echo "Options:"
      echo "  -g, --resource-group    Resource group name (required)"
      echo "  -p, --parameters        Parameters file (default: parameters.json)"
      echo "  -n, --name              Deployment name (default: storybook-<timestamp>)"
      echo "  --what-if               Run what-if analysis instead of deploying"
      echo "  -h, --help              Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$RESOURCE_GROUP" ]; then
  echo -e "${RED}Error: Resource group is required${NC}"
  echo "Usage: $0 -g <resource-group> [-p <parameters-file>]"
  exit 1
fi

# Check if parameters file exists
if [ ! -f "$PARAMETERS_FILE" ]; then
  echo -e "${RED}Error: Parameters file not found: $PARAMETERS_FILE${NC}"
  exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
  echo -e "${RED}Error: Not logged in to Azure. Run 'az login' first.${NC}"
  exit 1
fi

echo -e "${GREEN}Azure Bicep Deployment${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Parameters File: $PARAMETERS_FILE"
echo "Deployment Name: $DEPLOYMENT_NAME"
echo ""

# Build Bicep template
echo -e "${YELLOW}Building Bicep template...${NC}"
az bicep build --file main.bicep

if [ "$WHAT_IF" = true ]; then
  # Run what-if analysis
  echo -e "${YELLOW}Running what-if analysis...${NC}"
  az deployment group what-if \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main.bicep \
    --parameters "@$PARAMETERS_FILE" \
    --name "$DEPLOYMENT_NAME"
else
  # Deploy
  echo -e "${YELLOW}Deploying infrastructure...${NC}"
  az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file main.bicep \
    --parameters "@$PARAMETERS_FILE" \
    --name "$DEPLOYMENT_NAME"
  
  # Get outputs
  echo -e "${GREEN}Deployment complete!${NC}"
  echo ""
  echo -e "${YELLOW}Outputs:${NC}"
  az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DEPLOYMENT_NAME" \
    --query properties.outputs \
    --output table
fi

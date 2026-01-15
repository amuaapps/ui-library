#!/bin/bash
# Upload Storybook to Azure Storage Account
# Usage: ./upload-azure.sh <storage-account> <storybook-dir> [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STORAGE_ACCOUNT=""
STORYBOOK_DIR="storybook-static"
CONTAINER_NAME='$web'
DRY_RUN=false
PURGE_CDN=false
CDN_PROFILE=""
CDN_ENDPOINT=""
RESOURCE_GROUP=""
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--account)
      STORAGE_ACCOUNT="$2"
      shift 2
      ;;
    -d|--directory)
      STORYBOOK_DIR="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --purge-cdn)
      PURGE_CDN=true
      shift
      ;;
    --cdn-profile)
      CDN_PROFILE="$2"
      shift 2
      ;;
    --cdn-endpoint)
      CDN_ENDPOINT="$2"
      shift 2
      ;;
    -g|--resource-group)
      RESOURCE_GROUP="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 -a <storage-account> [-d <storybook-dir>] [options]"
      echo ""
      echo "Required:"
      echo "  -a, --account           Storage account name"
      echo ""
      echo "Optional:"
      echo "  -d, --directory         Storybook directory (default: storybook-static)"
      echo "  --dry-run               Show what would be uploaded without uploading"
      echo "  --purge-cdn             Purge CDN cache after upload"
      echo "  --cdn-profile           CDN profile name (required with --purge-cdn)"
      echo "  --cdn-endpoint          CDN endpoint name (required with --purge-cdn)"
      echo "  -g, --resource-group    Resource group name (required with --purge-cdn)"
      echo "  -v, --verbose           Show detailed output"
      echo "  -h, --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 -a sbuilibrarygreen"
      echo "  $0 -a sbuilibrarygreen --purge-cdn --cdn-profile cdn-profile --cdn-endpoint storybook -g rg-ui-library-prod"
      echo "  $0 -a sbuilibrarygreen --dry-run"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$STORAGE_ACCOUNT" ]; then
  echo -e "${RED}Error: Storage account name is required${NC}"
  echo "Usage: $0 -a <storage-account> [-d <storybook-dir>]"
  exit 1
fi

# Check if Storybook directory exists
if [ ! -d "$STORYBOOK_DIR" ]; then
  echo -e "${RED}Error: Storybook directory not found: $STORYBOOK_DIR${NC}"
  echo "Run 'npm run build-storybook' first"
  exit 1
fi

# Check if index.html exists
if [ ! -f "$STORYBOOK_DIR/index.html" ]; then
  echo -e "${RED}Error: index.html not found in $STORYBOOK_DIR${NC}"
  echo "Storybook build may be incomplete"
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

# Validate CDN purge requirements
if [ "$PURGE_CDN" = true ]; then
  if [ -z "$CDN_PROFILE" ] || [ -z "$CDN_ENDPOINT" ] || [ -z "$RESOURCE_GROUP" ]; then
    echo -e "${RED}Error: --cdn-profile, --cdn-endpoint, and --resource-group are required when using --purge-cdn${NC}"
    exit 1
  fi
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Storybook Upload to Azure Storage   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Storage Account: $STORAGE_ACCOUNT"
echo "  Container: $CONTAINER_NAME"
echo "  Directory: $STORYBOOK_DIR"
echo "  Dry Run: $DRY_RUN"
echo "  Purge CDN: $PURGE_CDN"
if [ -n "$CDN_PROFILE" ]; then
  echo "  CDN Profile: $CDN_PROFILE"
  echo "  CDN Endpoint: $CDN_ENDPOINT"
  echo "  Resource Group: $RESOURCE_GROUP"
fi
echo ""

# Count files to upload
FILE_COUNT=$(find "$STORYBOOK_DIR" -type f | wc -l | tr -d ' ')
echo -e "${YELLOW}Files to upload: $FILE_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN MODE - No files will be uploaded${NC}"
  echo ""
  
  # List files that would be uploaded
  echo -e "${YELLOW}Files that would be uploaded:${NC}"
  find "$STORYBOOK_DIR" -type f | head -20
  if [ $FILE_COUNT -gt 20 ]; then
    echo "... and $((FILE_COUNT - 20)) more files"
  fi
  echo ""
  
  echo -e "${YELLOW}Dry run completed - no files were uploaded${NC}"
  echo "Remove --dry-run flag to perform actual upload"
  exit 0
fi

# Upload assets with long cache (JS, CSS, fonts, images)
echo -e "${GREEN}Step 1/3: Uploading assets with long cache...${NC}"

# Get list of asset files (exclude HTML, JSON, TXT)
ASSET_FILES=$(find "$STORYBOOK_DIR" -type f \
  ! -name "*.html" \
  ! -name "*.json" \
  ! -name "*.txt" \
  -print)

if [ -n "$ASSET_FILES" ]; then
  # Upload assets in batch
  echo "$ASSET_FILES" | while read -r file; do
    BLOB_NAME="${file#$STORYBOOK_DIR/}"
    
    if [ "$VERBOSE" = true ]; then
      echo "  Uploading: $BLOB_NAME"
    fi
    
    az storage blob upload \
      --account-name "$STORAGE_ACCOUNT" \
      --container-name "$CONTAINER_NAME" \
      --name "$BLOB_NAME" \
      --file "$file" \
      --overwrite \
      --content-cache-control "public, max-age=31536000, immutable" \
      --output none
  done
  
  echo -e "${GREEN}✓ Assets uploaded${NC}"
else
  echo -e "${YELLOW}⚠ No asset files found${NC}"
fi
echo ""

# Upload HTML/JSON with short cache
echo -e "${GREEN}Step 2/3: Uploading HTML/JSON with short cache...${NC}"

# Get list of HTML/JSON/TXT files
CONTENT_FILES=$(find "$STORYBOOK_DIR" -type f \
  \( -name "*.html" -o -name "*.json" -o -name "*.txt" \) \
  -print)

if [ -n "$CONTENT_FILES" ]; then
  echo "$CONTENT_FILES" | while read -r file; do
    BLOB_NAME="${file#$STORYBOOK_DIR/}"
    
    if [ "$VERBOSE" = true ]; then
      echo "  Uploading: $BLOB_NAME"
    fi
    
    az storage blob upload \
      --account-name "$STORAGE_ACCOUNT" \
      --container-name "$CONTAINER_NAME" \
      --name "$BLOB_NAME" \
      --file "$file" \
      --overwrite \
      --content-cache-control "public, max-age=0, must-revalidate" \
      --output none
  done
  
  echo -e "${GREEN}✓ HTML/JSON uploaded${NC}"
else
  echo -e "${YELLOW}⚠ No HTML/JSON files found${NC}"
fi
echo ""

# CDN purge
if [ "$PURGE_CDN" = true ]; then
  echo -e "${GREEN}Step 3/3: Purging CDN cache...${NC}"
  
  az cdn endpoint purge \
    --resource-group "$RESOURCE_GROUP" \
    --profile-name "$CDN_PROFILE" \
    --name "$CDN_ENDPOINT" \
    --content-paths "/*" \
    --output none
  
  echo -e "${GREEN}✓ CDN cache purged${NC}"
  echo "  This may take 1-5 minutes to propagate"
  echo ""
else
  echo -e "${YELLOW}Step 3/3: Skipped (CDN purge not requested)${NC}"
  echo ""
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Upload Complete                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Storybook uploaded successfully${NC}"
echo ""
echo "Next steps:"
echo "  1. Validate the deployment:"
echo "     curl -I https://$STORAGE_ACCOUNT.z13.web.core.windows.net/index.html"
echo ""
echo "  2. Test Storybook loads:"
echo "     Open https://$STORAGE_ACCOUNT.z13.web.core.windows.net in browser"
echo ""
echo "  3. Switch to this environment (if validated):"
echo "     cd adapters/azure/storybook/bicep"
echo "     az deployment group create --parameters activeEnvironment=green ..."

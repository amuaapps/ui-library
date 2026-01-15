#!/bin/bash
# Upload Storybook to AWS S3 bucket
# Usage: ./upload-aws.sh <bucket-name> <storybook-dir> [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BUCKET_NAME=""
STORYBOOK_DIR="storybook-static"
DRY_RUN=false
INVALIDATE_CDN=false
DISTRIBUTION_ID=""
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--bucket)
      BUCKET_NAME="$2"
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
    --invalidate)
      INVALIDATE_CDN=true
      shift
      ;;
    --distribution-id)
      DISTRIBUTION_ID="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 -b <bucket-name> [-d <storybook-dir>] [options]"
      echo ""
      echo "Required:"
      echo "  -b, --bucket            S3 bucket name"
      echo ""
      echo "Optional:"
      echo "  -d, --directory         Storybook directory (default: storybook-static)"
      echo "  --dry-run               Show what would be uploaded without uploading"
      echo "  --invalidate            Create CloudFront invalidation after upload"
      echo "  --distribution-id       CloudFront distribution ID (required with --invalidate)"
      echo "  -v, --verbose           Show detailed output"
      echo "  -h, --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 -b storybook-green-ui-library-prod"
      echo "  $0 -b storybook-green-ui-library-prod --invalidate --distribution-id E1234567890ABC"
      echo "  $0 -b storybook-green-ui-library-prod --dry-run"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [ -z "$BUCKET_NAME" ]; then
  echo -e "${RED}Error: Bucket name is required${NC}"
  echo "Usage: $0 -b <bucket-name> [-d <storybook-dir>]"
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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not installed${NC}"
  echo "Install from: https://aws.amazon.com/cli/"
  exit 1
fi

# Check if logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Error: Not authenticated with AWS${NC}"
  echo "Run 'aws configure' or set AWS credentials"
  exit 1
fi

# Validate CloudFront invalidation requirements
if [ "$INVALIDATE_CDN" = true ] && [ -z "$DISTRIBUTION_ID" ]; then
  echo -e "${RED}Error: --distribution-id is required when using --invalidate${NC}"
  exit 1
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Storybook Upload to AWS S3          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Bucket: $BUCKET_NAME"
echo "  Directory: $STORYBOOK_DIR"
echo "  Dry Run: $DRY_RUN"
echo "  Invalidate CDN: $INVALIDATE_CDN"
if [ -n "$DISTRIBUTION_ID" ]; then
  echo "  Distribution ID: $DISTRIBUTION_ID"
fi
echo ""

# Count files to upload
FILE_COUNT=$(find "$STORYBOOK_DIR" -type f | wc -l | tr -d ' ')
echo -e "${YELLOW}Files to upload: $FILE_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}DRY RUN MODE - No files will be uploaded${NC}"
  echo ""
fi

# Upload assets with long cache (JS, CSS, fonts, images)
echo -e "${GREEN}Step 1/3: Uploading assets with long cache...${NC}"
SYNC_CMD="aws s3 sync \"$STORYBOOK_DIR/\" \"s3://$BUCKET_NAME/\" \
  --delete \
  --cache-control \"public, max-age=31536000, immutable\" \
  --exclude \"*.html\" \
  --exclude \"*.json\" \
  --exclude \"*.txt\""

if [ "$VERBOSE" = true ]; then
  SYNC_CMD="$SYNC_CMD --debug"
fi

if [ "$DRY_RUN" = true ]; then
  SYNC_CMD="$SYNC_CMD --dryrun"
fi

eval $SYNC_CMD

echo -e "${GREEN}✓ Assets uploaded${NC}"
echo ""

# Upload HTML/JSON with short cache
echo -e "${GREEN}Step 2/3: Uploading HTML/JSON with short cache...${NC}"
SYNC_CMD="aws s3 sync \"$STORYBOOK_DIR/\" \"s3://$BUCKET_NAME/\" \
  --cache-control \"public, max-age=0, must-revalidate\" \
  --exclude \"*\" \
  --include \"*.html\" \
  --include \"*.json\" \
  --include \"*.txt\""

if [ "$VERBOSE" = true ]; then
  SYNC_CMD="$SYNC_CMD --debug"
fi

if [ "$DRY_RUN" = true ]; then
  SYNC_CMD="$SYNC_CMD --dryrun"
fi

eval $SYNC_CMD

echo -e "${GREEN}✓ HTML/JSON uploaded${NC}"
echo ""

# CloudFront invalidation
if [ "$INVALIDATE_CDN" = true ] && [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}Step 3/3: Creating CloudFront invalidation...${NC}"
  
  INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --output json)
  
  INVALIDATION_ID=$(echo "$INVALIDATION_OUTPUT" | grep -o '"Id": "[^"]*"' | cut -d'"' -f4)
  
  echo -e "${GREEN}✓ Invalidation created: $INVALIDATION_ID${NC}"
  echo "  Status: In Progress"
  echo "  This may take 1-5 minutes to complete"
  echo ""
else
  echo -e "${YELLOW}Step 3/3: Skipped (CloudFront invalidation not requested)${NC}"
  echo ""
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Upload Complete                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}✓ Storybook uploaded successfully${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Validate the deployment:"
  echo "     curl -I https://your-cloudfront-url/index.html"
  echo ""
  echo "  2. Test Storybook loads:"
  echo "     Open https://your-cloudfront-url in browser"
  echo ""
  echo "  3. Switch to this environment (if validated):"
  echo "     cd adapters/aws/storybook/terraform"
  echo "     terraform apply -var=\"active_environment=green\""
else
  echo -e "${YELLOW}Dry run completed - no files were uploaded${NC}"
  echo "Remove --dry-run flag to perform actual upload"
fi

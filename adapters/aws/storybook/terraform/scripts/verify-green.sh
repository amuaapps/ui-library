#!/bin/bash
set -euo pipefail

# Verify GREEN deployment script
# This validates that the GREEN bucket has the required Storybook files
# before switching CloudFront to point to it.
#
# Usage:
#   ./verify-green.sh [bucket-name]
#
# If bucket-name is not provided, it will be read from Terraform outputs

BUCKET_NAME="${1:-}"

if [ -z "$BUCKET_NAME" ]; then
  # Get bucket name from Terraform outputs
  if [ -f "terraform.tfstate" ] || terraform state list &> /dev/null; then
    BUCKET_NAME=$(terraform output -raw green_bucket_name 2>/dev/null || echo "")
  fi
  
  if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Error: GREEN bucket name not provided and could not be determined from Terraform state"
    echo "Usage: $0 <bucket-name>"
    exit 1
  fi
fi

echo "🔍 Verifying GREEN deployment..."
echo "  Bucket: $BUCKET_NAME"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed"
  exit 1
fi

# Check if bucket exists
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "❌ Error: Bucket $BUCKET_NAME does not exist or is not accessible"
  exit 1
fi

echo "✓ Bucket exists and is accessible"

# Required files for a valid Storybook deployment
REQUIRED_FILES=(
  "index.html"
  "iframe.html"
)

# Check for required files
echo ""
echo "Checking required files..."
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if aws s3api head-object --bucket "$BUCKET_NAME" --key "$file" &> /dev/null; then
    echo "  ✓ $file"
  else
    echo "  ❌ $file (missing)"
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo ""
  echo "❌ Verification failed: Missing required files"
  echo "Missing files: ${MISSING_FILES[*]}"
  exit 1
fi

# Check if static assets directory exists
echo ""
echo "Checking static assets..."
ASSET_COUNT=$(aws s3 ls "s3://$BUCKET_NAME/" --recursive | wc -l)
echo "  Total files: $ASSET_COUNT"

if [ "$ASSET_COUNT" -lt 2 ]; then
  echo "  ⚠️  Warning: Very few files found. Deployment may be incomplete."
  exit 1
fi

echo "  ✓ Static assets present"

# Optional: Test if index.html is accessible via S3 website endpoint
echo ""
echo "Testing S3 website endpoint..."
WEBSITE_ENDPOINT=$(aws s3api get-bucket-website --bucket "$BUCKET_NAME" --query 'IndexDocument.Suffix' --output text 2>/dev/null || echo "")

if [ -n "$WEBSITE_ENDPOINT" ]; then
  # Get the bucket region
  REGION=$(aws s3api get-bucket-location --bucket "$BUCKET_NAME" --query 'LocationConstraint' --output text 2>/dev/null || echo "us-east-1")
  if [ "$REGION" = "None" ] || [ -z "$REGION" ]; then
    REGION="us-east-1"
  fi
  
  # Construct website URL
  if [ "$REGION" = "us-east-1" ]; then
    WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
  else
    WEBSITE_URL="http://${BUCKET_NAME}.s3-website.${REGION}.amazonaws.com"
  fi
  
  echo "  Testing: $WEBSITE_URL"
  
  # Test with curl (follow redirects, check for 200 status)
  if curl -f -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" | grep -q "200"; then
    echo "  ✓ Website endpoint is accessible"
  else
    echo "  ⚠️  Warning: Website endpoint returned non-200 status"
    echo "  This may be expected if website hosting is not enabled"
  fi
else
  echo "  ℹ️  Website hosting not configured (this is OK if using CloudFront only)"
fi

echo ""
echo "✅ GREEN deployment verification passed!"
echo ""
echo "Next steps:"
echo "1. Review the deployment at the GREEN URL"
echo "2. Run switch script to promote GREEN to active"
echo "3. Invalidate CloudFront cache if using CDN"

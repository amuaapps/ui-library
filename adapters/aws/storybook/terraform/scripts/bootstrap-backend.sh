#!/bin/bash
set -euo pipefail

# Bootstrap script for Terraform remote state backend
# This creates the S3 bucket and DynamoDB table required for remote state management
#
# Usage:
#   ./bootstrap-backend.sh <bucket-name> <dynamodb-table-name> <region>
#
# Example:
#   ./bootstrap-backend.sh my-terraform-state terraform-state-locks us-east-1

BUCKET_NAME="${1:-}"
DYNAMODB_TABLE="${2:-terraform-state-locks}"
REGION="${3:-us-east-1}"

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Bucket name is required"
  echo "Usage: $0 <bucket-name> [dynamodb-table-name] [region]"
  exit 1
fi

echo "🚀 Bootstrapping Terraform backend..."
echo "  Bucket: $BUCKET_NAME"
echo "  DynamoDB Table: $DYNAMODB_TABLE"
echo "  Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ Error: AWS CLI is not installed"
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ Error: AWS credentials not configured or invalid"
  exit 1
fi

echo "✓ AWS credentials validated"

# Create S3 bucket for state storage
echo ""
echo "📦 Creating S3 bucket: $BUCKET_NAME"

if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "  ℹ️  Bucket already exists"
else
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --region "$REGION"
  else
    aws s3api create-bucket \
      --bucket "$BUCKET_NAME" \
      --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
  echo "  ✓ Bucket created"
fi

# Enable versioning
echo "  Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled
echo "  ✓ Versioning enabled"

# Enable encryption
echo "  Enabling encryption..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'
echo "  ✓ Encryption enabled"

# Block public access
echo "  Blocking public access..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "  ✓ Public access blocked"

# Create DynamoDB table for state locking
echo ""
echo "🔒 Creating DynamoDB table: $DYNAMODB_TABLE"

if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$REGION" &> /dev/null; then
  echo "  ℹ️  Table already exists"
else
  aws dynamodb create-table \
    --table-name "$DYNAMODB_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION" \
    --tags Key=Purpose,Value=TerraformStateLocking Key=ManagedBy,Value=BootstrapScript
  
  echo "  ⏳ Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$REGION"
  echo "  ✓ Table created"
fi

echo ""
echo "✅ Backend bootstrap complete!"
echo ""
echo "Next steps:"
echo "1. Create a backend.hcl file with these values:"
echo "   bucket         = \"$BUCKET_NAME\""
echo "   key            = \"ui-library/storybook/{environment}/terraform.tfstate\""
echo "   region         = \"$REGION\""
echo "   dynamodb_table = \"$DYNAMODB_TABLE\""
echo "   encrypt        = true"
echo ""
echo "2. Initialize Terraform with backend config:"
echo "   terraform init -backend-config=backend.hcl"
echo ""
echo "3. For CI/CD, set these GitHub secrets/vars:"
echo "   TF_STATE_BUCKET: $BUCKET_NAME"
echo "   TF_STATE_DYNAMODB_TABLE: $DYNAMODB_TABLE"
echo "   TF_STATE_REGION: $REGION"

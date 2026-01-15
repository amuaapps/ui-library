# Storybook Deployment Guide

This guide explains how to deploy Storybook to cloud infrastructure using the blue/green deployment strategy.

## Overview

Storybook deployment follows a safe, validated deployment process:

1. **Build** - Generate static Storybook files
2. **Upload to GREEN** - Deploy to candidate environment
3. **Validate GREEN** - Verify deployment is healthy
4. **Switch to GREEN** - Promote to active
5. **Verify ACTIVE** - Confirm switch successful

## Prerequisites

### For AWS

- AWS CLI configured with credentials
- Terraform deployed infrastructure
- Terraform outputs available
- `aws` command in PATH

### For Azure

- Azure CLI logged in
- Bicep deployed infrastructure
- Deployment outputs available
- `az` command in PATH

## Deployment Steps

### Step 1: Build Storybook

```bash
# From repository root
npm run build-storybook
```

**Verify:**
```bash
# Check output directory exists
ls -la storybook-static/

# Verify index.html exists
test -f storybook-static/index.html && echo "✓ Build successful"
```

**Output:**
- Directory: `storybook-static/`
- Entry point: `index.html`
- Assets: JavaScript, CSS, fonts, images

### Step 2: Upload to GREEN Environment

#### AWS (S3)

```bash
# Get GREEN bucket name from Terraform outputs
cd adapters/aws/storybook/terraform
GREEN_BUCKET=$(terraform output -raw upload_target_green)

# Upload Storybook files
cd ../../../../  # Back to repo root
aws s3 sync storybook-static/ s3://${GREEN_BUCKET}/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML/JSON with shorter cache
aws s3 sync storybook-static/ s3://${GREEN_BUCKET}/ \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --cache-control "public, max-age=0, must-revalidate"
```

**Why different cache headers:**
- Assets (JS/CSS): Long cache (1 year) - content-hashed filenames
- HTML/JSON: No cache - entry points that reference assets

#### Azure (Storage Account)

```bash
# Get GREEN storage account from Bicep outputs
cd adapters/azure/storybook/bicep
GREEN_ACCOUNT=$(az deployment group show \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --name main \
  --query 'properties.outputs.uploadTargetGreen.value' \
  --output tsv)

# Upload Storybook files
cd ../../../../  # Back to repo root
az storage blob upload-batch \
  --account-name ${GREEN_ACCOUNT} \
  --destination '$web' \
  --source storybook-static/ \
  --overwrite \
  --content-cache-control "public, max-age=31536000, immutable" \
  --pattern "*.js" --pattern "*.css" --pattern "*.woff2"

# Upload HTML/JSON with shorter cache
az storage blob upload-batch \
  --account-name ${GREEN_ACCOUNT} \
  --destination '$web' \
  --source storybook-static/ \
  --overwrite \
  --content-cache-control "public, max-age=0, must-revalidate" \
  --pattern "*.html" --pattern "*.json"
```

### Step 3: Validate GREEN Environment

#### Get GREEN URL

**AWS:**
```bash
cd adapters/aws/storybook/terraform
GREEN_URL=$(terraform output -raw storybook_url_green)
echo "GREEN URL: ${GREEN_URL}"
```

**Azure:**
```bash
cd adapters/azure/storybook/bicep
GREEN_URL=$(az deployment group show \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --name main \
  --query 'properties.outputs.storybookUrlGreen.value' \
  --output tsv)
echo "GREEN URL: ${GREEN_URL}"
```

#### Verify Deployment

```bash
# Check index.html is accessible
curl -I ${GREEN_URL}/index.html

# Expected: HTTP 200 OK

# Check Storybook loads (basic smoke test)
curl -s ${GREEN_URL}/index.html | grep -q "Storybook" && echo "✓ Storybook detected"

# Check a sample asset loads
curl -I ${GREEN_URL}/iframe.html

# Expected: HTTP 200 OK
```

#### Advanced Validation (Optional)

```bash
# Check multiple endpoints
for path in index.html iframe.html project.json; do
  echo "Checking ${path}..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${GREEN_URL}/${path})
  if [ "$STATUS" = "200" ]; then
    echo "✓ ${path} - OK"
  else
    echo "✗ ${path} - Failed (${STATUS})"
    exit 1
  fi
done
```

### Step 4: Switch to GREEN

See `switch.md` for detailed switch commands.

**Quick reference:**

**AWS:**
```bash
cd adapters/aws/storybook/terraform
terraform apply -var="active_environment=green"
```

**Azure:**
```bash
cd adapters/azure/storybook/bicep
az deployment group create \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=green
```

### Step 5: Verify ACTIVE Environment

```bash
# Get ACTIVE URL
ACTIVE_URL=$(terraform output -raw storybook_url_active)  # AWS
# or
ACTIVE_URL=$(az deployment group show ... --query 'properties.outputs.storybookUrlActive.value')  # Azure

# Verify it now points to GREEN
curl -I ${ACTIVE_URL}/index.html

# Check Storybook loads
curl -s ${ACTIVE_URL}/index.html | grep -q "Storybook" && echo "✓ Switch successful"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build Storybook
        run: npm run build-storybook
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Upload to GREEN
        run: |
          aws s3 sync storybook-static/ s3://storybook-green-${{ github.run_number }}/ --delete
          
      - name: Validate GREEN
        run: |
          GREEN_URL="https://storybook-green.example.com"
          curl -f ${GREEN_URL}/index.html || exit 1
          
      - name: Switch to GREEN
        run: |
          cd adapters/aws/storybook/terraform
          terraform apply -auto-approve -var="active_environment=green"
          
      - name: Verify ACTIVE
        run: |
          ACTIVE_URL="https://storybook.example.com"
          curl -f ${ACTIVE_URL}/index.html || exit 1
```

## Rollback Procedure

If issues are discovered after switching to GREEN:

### Step 1: Identify Issue

- Monitor error rates
- Check user reports
- Verify Storybook functionality

### Step 2: Revert to BLUE

**AWS:**
```bash
cd adapters/aws/storybook/terraform
terraform apply -var="active_environment=blue"
```

**Azure:**
```bash
cd adapters/azure/storybook/bicep
az deployment group create \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=blue
```

### Step 3: Verify Rollback

```bash
# Check ACTIVE URL now points to BLUE
ACTIVE_URL=$(terraform output -raw storybook_url_active)
curl -I ${ACTIVE_URL}/index.html

# Verify old version is back
curl -s ${ACTIVE_URL}/index.html | grep -q "Storybook" && echo "✓ Rollback successful"
```

### Step 4: Fix GREEN

- Investigate issue
- Fix and rebuild Storybook
- Re-upload to GREEN
- Re-validate before switching again

## Best Practices

### Cache Invalidation

**AWS CloudFront:**
```bash
# Create invalidation for immediate update
DISTRIBUTION_ID=$(terraform output -raw cdn_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

**Azure CDN:**
```bash
# Purge CDN cache
az cdn endpoint purge \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --profile-name cdn-profile \
  --name storybook \
  --content-paths "/*"
```

### Deployment Timing

**Recommended:**
- Deploy during low-traffic periods
- Allow 5-10 minutes for CDN propagation
- Monitor for 15-30 minutes after switch

**Avoid:**
- Deploying during peak hours
- Multiple deployments in quick succession
- Switching without validation

### Monitoring

**Key Metrics:**
- HTTP 200 response rate
- Page load time
- CDN cache hit ratio
- Error rate (4xx, 5xx)

**Alerts:**
- Error rate > 5%
- Response time > 3 seconds
- Cache hit ratio < 80%

## Troubleshooting

### Upload Fails

**Issue: Permission denied**
```bash
# AWS: Check IAM permissions
aws sts get-caller-identity

# Azure: Check logged in account
az account show
```

**Issue: Bucket/container not found**
```bash
# Verify infrastructure is deployed
terraform output  # AWS
az deployment group show ...  # Azure
```

### Validation Fails

**Issue: 404 Not Found**
- Verify files were uploaded correctly
- Check bucket/container permissions
- Verify CDN origin configuration

**Issue: 403 Forbidden**
- Check bucket policy (AWS)
- Check storage account access (Azure)
- Verify CDN has access to origin

### Switch Doesn't Take Effect

**Issue: Still seeing old version**
- Wait for CDN propagation (1-5 minutes)
- Create cache invalidation
- Check browser cache (hard refresh)

**Issue: Switch command fails**
- Verify Terraform/Bicep state is current
- Check cloud provider credentials
- Review error messages

## Security Considerations

### Credentials

**Never:**
- Commit credentials to repository
- Share credentials in plain text
- Use root/admin credentials

**Always:**
- Use CI/CD secrets management
- Rotate credentials regularly
- Use least privilege permissions

### Access Control

**Upload permissions:**
- Write-only to storage
- No read or delete permissions needed
- Scoped to specific bucket/container

**Public access:**
- Read-only via CDN
- No direct storage access
- HTTPS only

## Cost Optimization

### Minimize Uploads

```bash
# Only upload changed files
aws s3 sync storybook-static/ s3://bucket/ \
  --size-only \
  --delete
```

### Compress Before Upload

```bash
# Gzip compress assets
find storybook-static -type f \( -name "*.js" -o -name "*.css" \) -exec gzip -9 {} \;

# Upload with content-encoding
aws s3 sync storybook-static/ s3://bucket/ \
  --content-encoding gzip \
  --exclude "*" \
  --include "*.gz"
```

### Lifecycle Policies

**AWS S3:**
- Delete old versions after 30 days
- Transition to cheaper storage class

**Azure Storage:**
- Delete old blobs after 30 days
- Use cool tier for archives

## References

- [Switch Guide](./switch.md)
- [Main Documentation](../../../docs/STORYBOOK-HOSTING.md)
- [AWS S3 Sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html)
- [Azure Storage Upload](https://docs.microsoft.com/en-us/cli/azure/storage/blob)

# Storybook Upload Guide

This guide explains how to upload Storybook static files to cloud storage using the provided helper scripts or manual commands.

## Overview

Storybook is built as static files and uploaded to cloud storage (S3 or Azure Storage). The upload process:

1. **Build** - Generate static files with `npm run build-storybook`
2. **Upload** - Transfer files to cloud storage
3. **Cache Control** - Set appropriate cache headers
4. **Validate** - Verify deployment is accessible
5. **Switch** - Promote to active (blue/green)

## Prerequisites

### For AWS
- AWS CLI installed and configured
- Credentials with S3 write permissions
- Terraform outputs available (bucket names)

### For Azure
- Azure CLI installed and logged in
- Credentials with Storage Blob Data Contributor role
- Bicep outputs available (storage account names)

## Upload Scripts

Two helper scripts are provided for simplified uploads:

### AWS Upload Script

**Location:** `adapters/shared/storybook/upload-aws.sh`

**Basic Usage:**
```bash
./adapters/shared/storybook/upload-aws.sh -b <bucket-name>
```

**With CloudFront Invalidation:**
```bash
./adapters/shared/storybook/upload-aws.sh \
  -b storybook-green-ui-library-prod \
  --invalidate \
  --distribution-id E1234567890ABC
```

**Dry Run (Preview):**
```bash
./adapters/shared/storybook/upload-aws.sh \
  -b storybook-green-ui-library-prod \
  --dry-run
```

**Options:**
- `-b, --bucket` - S3 bucket name (required)
- `-d, --directory` - Storybook directory (default: storybook-static)
- `--dry-run` - Preview without uploading
- `--invalidate` - Create CloudFront invalidation
- `--distribution-id` - CloudFront distribution ID
- `-v, --verbose` - Show detailed output
- `-h, --help` - Show help

### Azure Upload Script

**Location:** `adapters/shared/storybook/upload-azure.sh`

**Basic Usage:**
```bash
./adapters/shared/storybook/upload-azure.sh -a <storage-account>
```

**With CDN Purge:**
```bash
./adapters/shared/storybook/upload-azure.sh \
  -a sbuilibrarygreen \
  --purge-cdn \
  --cdn-profile cdn-ui-library-prod \
  --cdn-endpoint storybook-ui-library-prod \
  -g rg-ui-library-prod
```

**Dry Run (Preview):**
```bash
./adapters/shared/storybook/upload-azure.sh \
  -a sbuilibrarygreen \
  --dry-run
```

**Options:**
- `-a, --account` - Storage account name (required)
- `-d, --directory` - Storybook directory (default: storybook-static)
- `--dry-run` - Preview without uploading
- `--purge-cdn` - Purge CDN cache
- `--cdn-profile` - CDN profile name
- `--cdn-endpoint` - CDN endpoint name
- `-g, --resource-group` - Resource group name
- `-v, --verbose` - Show detailed output
- `-h, --help` - Show help

## Manual Upload Commands

### AWS S3

**Step 1: Upload assets with long cache**
```bash
aws s3 sync storybook-static/ s3://storybook-green-ui-library-prod/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json" \
  --exclude "*.txt"
```

**Step 2: Upload HTML/JSON with short cache**
```bash
aws s3 sync storybook-static/ s3://storybook-green-ui-library-prod/ \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --include "*.txt"
```

**Step 3: Create CloudFront invalidation (optional)**
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### Azure Storage

**Step 1: Upload assets with long cache**
```bash
# Upload JS, CSS, fonts, images
find storybook-static -type f \
  ! -name "*.html" \
  ! -name "*.json" \
  ! -name "*.txt" \
  -exec az storage blob upload \
    --account-name sbuilibrarygreen \
    --container-name '$web' \
    --name {} \
    --file {} \
    --overwrite \
    --content-cache-control "public, max-age=31536000, immutable" \;
```

**Step 2: Upload HTML/JSON with short cache**
```bash
# Upload HTML, JSON, TXT
find storybook-static -type f \
  \( -name "*.html" -o -name "*.json" -o -name "*.txt" \) \
  -exec az storage blob upload \
    --account-name sbuilibrarygreen \
    --container-name '$web' \
    --name {} \
    --file {} \
    --overwrite \
    --content-cache-control "public, max-age=0, must-revalidate" \;
```

**Step 3: Purge CDN cache (optional)**
```bash
az cdn endpoint purge \
  --resource-group rg-ui-library-prod \
  --profile-name cdn-ui-library-prod \
  --name storybook-ui-library-prod \
  --content-paths "/*"
```

## Cache Control Strategy

### Why Two Different Cache Headers?

**Long Cache (1 year) for Assets:**
- JavaScript files: `main.abc123.js`
- CSS files: `styles.def456.css`
- Fonts: `font.woff2`
- Images: `logo.png`

**Reason:** Content-hashed filenames change when content changes, so safe to cache forever.

**Short Cache (0 seconds) for Entry Points:**
- HTML files: `index.html`, `iframe.html`
- JSON files: `project.json`
- Text files: `robots.txt`

**Reason:** Entry points reference assets by hash, must always fetch latest to get new asset references.

### Cache Header Details

**Long Cache:**
```
Cache-Control: public, max-age=31536000, immutable
```
- `public` - Can be cached by CDN and browsers
- `max-age=31536000` - Cache for 1 year (365 days)
- `immutable` - Never revalidate (content never changes)

**Short Cache:**
```
Cache-Control: public, max-age=0, must-revalidate
```
- `public` - Can be cached by CDN
- `max-age=0` - Immediately stale
- `must-revalidate` - Always check server for updates

## Getting Upload Targets

### From Terraform (AWS)

```bash
cd adapters/aws/storybook/terraform

# Get GREEN bucket name
GREEN_BUCKET=$(terraform output -raw upload_target_green)
echo "Upload to: $GREEN_BUCKET"

# Get distribution ID (for invalidation)
DIST_ID=$(terraform output -raw cdn_distribution_id)
echo "Distribution ID: $DIST_ID"
```

### From Bicep (Azure)

```bash
cd adapters/azure/storybook/bicep

# Get GREEN storage account
GREEN_ACCOUNT=$(az deployment group show \
  --resource-group rg-ui-library-prod \
  --name main \
  --query 'properties.outputs.uploadTargetGreen.value' \
  --output tsv)
echo "Upload to: $GREEN_ACCOUNT"

# Get CDN endpoint (for purge)
CDN_ENDPOINT=$(az deployment group show \
  --resource-group rg-ui-library-prod \
  --name main \
  --query 'properties.outputs.cdnEndpointName.value' \
  --output tsv)
echo "CDN Endpoint: $CDN_ENDPOINT"
```

## Complete Workflow Example

### AWS Workflow

```bash
# 1. Build Storybook
npm run build-storybook

# 2. Get infrastructure outputs
cd adapters/aws/storybook/terraform
GREEN_BUCKET=$(terraform output -raw upload_target_green)
GREEN_URL=$(terraform output -raw storybook_url_green)
DIST_ID=$(terraform output -raw cdn_distribution_id)
cd ../../../../

# 3. Upload to GREEN
./adapters/shared/storybook/upload-aws.sh \
  -b $GREEN_BUCKET \
  --invalidate \
  --distribution-id $DIST_ID

# 4. Validate GREEN
curl -I $GREEN_URL/index.html
curl -s $GREEN_URL/index.html | grep -q "Storybook" && echo "✓ Storybook detected"

# 5. Switch to GREEN
cd adapters/aws/storybook/terraform
terraform apply -var="active_environment=green" -auto-approve

# 6. Verify ACTIVE
ACTIVE_URL=$(terraform output -raw storybook_url_active)
curl -I $ACTIVE_URL/index.html
```

### Azure Workflow

```bash
# 1. Build Storybook
npm run build-storybook

# 2. Get infrastructure outputs
cd adapters/azure/storybook/bicep
RG="rg-ui-library-prod"
GREEN_ACCOUNT=$(az deployment group show \
  --resource-group $RG \
  --name main \
  --query 'properties.outputs.uploadTargetGreen.value' \
  --output tsv)
GREEN_URL=$(az deployment group show \
  --resource-group $RG \
  --name main \
  --query 'properties.outputs.storybookUrlGreen.value' \
  --output tsv)
CDN_PROFILE=$(az deployment group show \
  --resource-group $RG \
  --name main \
  --query 'properties.outputs.cdnProfileName.value' \
  --output tsv)
CDN_ENDPOINT=$(az deployment group show \
  --resource-group $RG \
  --name main \
  --query 'properties.outputs.cdnEndpointName.value' \
  --output tsv)
cd ../../../../

# 3. Upload to GREEN
./adapters/shared/storybook/upload-azure.sh \
  -a $GREEN_ACCOUNT \
  --purge-cdn \
  --cdn-profile $CDN_PROFILE \
  --cdn-endpoint $CDN_ENDPOINT \
  -g $RG

# 4. Validate GREEN
curl -I $GREEN_URL/index.html
curl -s $GREEN_URL/index.html | grep -q "Storybook" && echo "✓ Storybook detected"

# 5. Switch to GREEN
cd adapters/azure/storybook/bicep
az deployment group create \
  --resource-group $RG \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=green

# 6. Verify ACTIVE
ACTIVE_URL=$(az deployment group show \
  --resource-group $RG \
  --name main \
  --query 'properties.outputs.storybookUrlActive.value' \
  --output tsv)
curl -I $ACTIVE_URL/index.html
```

## CI/CD Integration

### GitHub Actions - AWS

```yaml
- name: Build Storybook
  run: npm run build-storybook

- name: Get Infrastructure Outputs
  id: infra
  run: |
    cd adapters/aws/storybook/terraform
    echo "green_bucket=$(terraform output -raw upload_target_green)" >> $GITHUB_OUTPUT
    echo "green_url=$(terraform output -raw storybook_url_green)" >> $GITHUB_OUTPUT
    echo "dist_id=$(terraform output -raw cdn_distribution_id)" >> $GITHUB_OUTPUT

- name: Upload to GREEN
  run: |
    ./adapters/shared/storybook/upload-aws.sh \
      -b ${{ steps.infra.outputs.green_bucket }} \
      --invalidate \
      --distribution-id ${{ steps.infra.outputs.dist_id }}

- name: Validate GREEN
  run: |
    curl -f ${{ steps.infra.outputs.green_url }}/index.html
    curl -s ${{ steps.infra.outputs.green_url }}/index.html | grep -q "Storybook"

- name: Switch to GREEN
  run: |
    cd adapters/aws/storybook/terraform
    terraform apply -var="active_environment=green" -auto-approve
```

### GitHub Actions - Azure

```yaml
- name: Build Storybook
  run: npm run build-storybook

- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Get Infrastructure Outputs
  id: infra
  run: |
    RG="rg-ui-library-prod"
    echo "green_account=$(az deployment group show --resource-group $RG --name main --query 'properties.outputs.uploadTargetGreen.value' -o tsv)" >> $GITHUB_OUTPUT
    echo "green_url=$(az deployment group show --resource-group $RG --name main --query 'properties.outputs.storybookUrlGreen.value' -o tsv)" >> $GITHUB_OUTPUT
    echo "cdn_profile=$(az deployment group show --resource-group $RG --name main --query 'properties.outputs.cdnProfileName.value' -o tsv)" >> $GITHUB_OUTPUT
    echo "cdn_endpoint=$(az deployment group show --resource-group $RG --name main --query 'properties.outputs.cdnEndpointName.value' -o tsv)" >> $GITHUB_OUTPUT

- name: Upload to GREEN
  run: |
    ./adapters/shared/storybook/upload-azure.sh \
      -a ${{ steps.infra.outputs.green_account }} \
      --purge-cdn \
      --cdn-profile ${{ steps.infra.outputs.cdn_profile }} \
      --cdn-endpoint ${{ steps.infra.outputs.cdn_endpoint }} \
      -g rg-ui-library-prod

- name: Validate GREEN
  run: |
    curl -f ${{ steps.infra.outputs.green_url }}/index.html
    curl -s ${{ steps.infra.outputs.green_url }}/index.html | grep -q "Storybook"

- name: Switch to GREEN
  run: |
    cd adapters/azure/storybook/bicep
    az deployment group create \
      --resource-group rg-ui-library-prod \
      --template-file main.bicep \
      --parameters parameters.json \
      --parameters activeEnvironment=green
```

## Troubleshooting

### Upload Fails with Permission Error

**AWS:**
```bash
# Check credentials
aws sts get-caller-identity

# Required permissions:
# - s3:PutObject
# - s3:DeleteObject (for --delete flag)
```

**Azure:**
```bash
# Check logged in account
az account show

# Required role:
# - Storage Blob Data Contributor
```

### Files Not Accessible After Upload

**Check bucket/container permissions:**

**AWS:**
```bash
# If using CloudFront, bucket should be private
# If not using CloudFront, bucket needs public read policy
aws s3api get-bucket-policy --bucket storybook-green-ui-library-prod
```

**Azure:**
```bash
# Check container public access level
az storage container show \
  --account-name sbuilibrarygreen \
  --name '$web' \
  --query 'properties.publicAccess'
```

### CDN Still Serving Old Version

**Create invalidation/purge:**

**AWS:**
```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

**Azure:**
```bash
az cdn endpoint purge \
  --resource-group rg-ui-library-prod \
  --profile-name cdn-ui-library-prod \
  --name storybook-ui-library-prod \
  --content-paths "/*"
```

**Wait for propagation:** 1-5 minutes

### Upload is Slow

**Optimize:**
- Use `--size-only` flag to skip unchanged files
- Upload from same region as bucket/storage
- Use parallel uploads (built into scripts)

**AWS:**
```bash
aws s3 sync storybook-static/ s3://bucket/ --size-only
```

**Azure:**
```bash
# Azure CLI uploads in parallel by default
```

## Best Practices

### Before Upload
- ✅ Build Storybook successfully
- ✅ Verify `storybook-static/index.html` exists
- ✅ Test locally: `npx http-server storybook-static`
- ✅ Get correct bucket/storage account name
- ✅ Use dry-run first to preview

### During Upload
- ✅ Use upload scripts for consistency
- ✅ Set correct cache headers
- ✅ Delete old files with `--delete` (AWS)
- ✅ Overwrite existing files (Azure)

### After Upload
- ✅ Validate GREEN URL is accessible
- ✅ Test Storybook loads in browser
- ✅ Check for console errors
- ✅ Verify components render
- ✅ Only switch after validation

### Security
- ✅ Never commit credentials
- ✅ Use CI/CD secrets for automation
- ✅ Use least privilege permissions
- ✅ Rotate credentials regularly

## References

- [Deployment Guide](./deploy.md)
- [Switch Guide](./switch.md)
- [Main Documentation](../../../docs/STORYBOOK-HOSTING.md)
- [AWS S3 Sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html)
- [Azure Storage Upload](https://docs.microsoft.com/en-us/cli/azure/storage/blob)

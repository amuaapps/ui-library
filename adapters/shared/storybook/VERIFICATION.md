# Storybook Verification Guide

This guide explains how to verify Storybook deployments before switching to production.

## Overview

Verification ensures that:
- Storybook is accessible
- All critical files load correctly
- Content is properly deployed
- No broken links or errors
- Performance is acceptable

## Verification Script

**Location:** `adapters/shared/storybook/verify.sh`

**Purpose:** Automated health checks for Storybook deployments

### Basic Usage

```bash
./adapters/shared/storybook/verify.sh -u <url>
```

### Examples

**Verify GREEN environment:**
```bash
# AWS
./adapters/shared/storybook/verify.sh \
  -u https://storybook-green.example.com

# Azure
./adapters/shared/storybook/verify.sh \
  -u https://storagegreen.z13.web.core.windows.net
```

**Verbose mode:**
```bash
./adapters/shared/storybook/verify.sh \
  -u https://storybook-green.example.com \
  --verbose
```

**With component checks:**
```bash
./adapters/shared/storybook/verify.sh \
  -u https://storybook-green.example.com \
  --check-components
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-u, --url` | Storybook URL to verify (required) | - |
| `-t, --timeout` | Request timeout in seconds | 10 |
| `-r, --retries` | Number of retries per test | 3 |
| `-v, --verbose` | Show detailed output | false |
| `--skip-assets` | Skip asset verification | false |
| `--check-components` | Check sample components | false |
| `-h, --help` | Show help message | - |

## Verification Tests

### Test 1: Index Page Accessibility

**What it checks:**
- `index.html` returns HTTP 200
- Page is accessible without errors

**Why it matters:**
- Entry point for Storybook
- Must be accessible for users

**Failure reasons:**
- Files not uploaded
- Incorrect permissions
- CDN not configured

### Test 2: Storybook Content Detection

**What it checks:**
- `index.html` contains "Storybook" text
- Page has expected content

**Why it matters:**
- Confirms correct build was uploaded
- Detects corrupted deployments

**Failure reasons:**
- Wrong files uploaded
- Build incomplete
- Content corruption

### Test 3: iframe.html Accessibility

**What it checks:**
- `iframe.html` returns HTTP 200
- Story preview frame loads

**Why it matters:**
- Required for component previews
- Core Storybook functionality

**Failure reasons:**
- Missing file
- Upload incomplete
- Permission issues

### Test 4: project.json Accessibility

**What it checks:**
- `project.json` returns HTTP 200
- Metadata file is accessible

**Why it matters:**
- Contains Storybook configuration
- Used by Storybook UI

**Failure reasons:**
- Missing file
- Upload incomplete
- JSON corruption

### Test 5: Asset Accessibility (Optional)

**What it checks:**
- Sample JavaScript asset loads
- Static assets are accessible

**Why it matters:**
- Confirms assets uploaded correctly
- Verifies CDN serves assets

**Failure reasons:**
- Assets not uploaded
- Incorrect cache headers
- CDN misconfiguration

### Test 6: Component Check (Optional)

**What it checks:**
- Sample component story loads
- Stories are accessible

**Why it matters:**
- Confirms components render
- End-to-end functionality

**Failure reasons:**
- Story files missing
- Component errors
- Build issues

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |

## Manual Verification

### Browser Checks

**1. Open Storybook URL**
```bash
# Get GREEN URL from infrastructure
GREEN_URL=$(terraform output -raw storybook_url_green)
open $GREEN_URL
```

**2. Visual Inspection**
- ✅ Storybook UI loads
- ✅ Sidebar shows components
- ✅ Theme switcher works
- ✅ No console errors
- ✅ Components render correctly

**3. Navigation**
- ✅ Click through components
- ✅ Test different stories
- ✅ Check docs pages
- ✅ Verify search works

**4. Performance**
- ✅ Page loads quickly (< 3s)
- ✅ No slow assets
- ✅ Smooth interactions

### Command Line Checks

**Check HTTP status:**
```bash
curl -I https://storybook-green.example.com/index.html
```

**Expected output:**
```
HTTP/2 200
content-type: text/html
cache-control: public, max-age=0, must-revalidate
```

**Check content:**
```bash
curl -s https://storybook-green.example.com/index.html | grep "Storybook"
```

**Expected:** Should find "Storybook" in output

**Check assets:**
```bash
curl -I https://storybook-green.example.com/iframe.html
curl -I https://storybook-green.example.com/project.json
```

**Expected:** Both return HTTP 200

## Integration with Deployment

### Complete Workflow

```bash
# 1. Build Storybook
npm run build-storybook

# 2. Upload to GREEN
./adapters/shared/storybook/upload-aws.sh -b storybook-green-ui-library-prod

# 3. Wait for propagation (if using CDN)
sleep 60

# 4. Verify GREEN
./adapters/shared/storybook/verify.sh -u https://storybook-green.example.com

# 5. If verification passes, switch
cd adapters/aws/storybook/terraform
terraform apply -var="active_environment=green"

# 6. Verify ACTIVE
ACTIVE_URL=$(terraform output -raw storybook_url_active)
./adapters/shared/storybook/verify.sh -u $ACTIVE_URL
```

## CI/CD Integration

### GitHub Actions - AWS

```yaml
- name: Upload to GREEN
  run: |
    ./adapters/shared/storybook/upload-aws.sh \
      -b ${{ steps.infra.outputs.green_bucket }} \
      --invalidate \
      --distribution-id ${{ steps.infra.outputs.dist_id }}

- name: Wait for CDN Propagation
  run: sleep 60

- name: Verify GREEN Deployment
  run: |
    ./adapters/shared/storybook/verify.sh \
      -u ${{ steps.infra.outputs.green_url }} \
      --verbose

- name: Switch to GREEN
  if: success()
  run: |
    cd adapters/aws/storybook/terraform
    terraform apply -var="active_environment=green" -auto-approve

- name: Verify ACTIVE Deployment
  run: |
    ./adapters/shared/storybook/verify.sh \
      -u ${{ steps.infra.outputs.active_url }} \
      --verbose
```

### GitHub Actions - Azure

```yaml
- name: Upload to GREEN
  run: |
    ./adapters/shared/storybook/upload-azure.sh \
      -a ${{ steps.infra.outputs.green_account }} \
      --purge-cdn \
      --cdn-profile ${{ steps.infra.outputs.cdn_profile }} \
      --cdn-endpoint ${{ steps.infra.outputs.cdn_endpoint }} \
      -g rg-ui-library-prod

- name: Wait for CDN Propagation
  run: sleep 60

- name: Verify GREEN Deployment
  run: |
    ./adapters/shared/storybook/verify.sh \
      -u ${{ steps.infra.outputs.green_url }} \
      --verbose

- name: Switch to GREEN
  if: success()
  run: |
    cd adapters/azure/storybook/bicep
    az deployment group create \
      --resource-group rg-ui-library-prod \
      --template-file main.bicep \
      --parameters parameters.json \
      --parameters activeEnvironment=green

- name: Verify ACTIVE Deployment
  run: |
    ./adapters/shared/storybook/verify.sh \
      -u ${{ steps.infra.outputs.active_url }} \
      --verbose
```

## Troubleshooting

### Test 1 Fails (Index Not Accessible)

**Symptoms:**
- HTTP 404 or 403
- Connection timeout

**Causes:**
1. Files not uploaded
2. Bucket/container permissions wrong
3. CDN not configured
4. DNS not resolving

**Solutions:**
```bash
# Check if files exist
aws s3 ls s3://storybook-green-ui-library-prod/  # AWS
az storage blob list --account-name storagegreen --container-name '$web'  # Azure

# Check bucket policy
aws s3api get-bucket-policy --bucket storybook-green-ui-library-prod

# Check CDN status
aws cloudfront get-distribution --id E1234567890ABC
az cdn endpoint show --resource-group rg --profile-name cdn --name endpoint
```

### Test 2 Fails (Content Not Found)

**Symptoms:**
- Page loads but no "Storybook" text
- Wrong content displayed

**Causes:**
1. Wrong files uploaded
2. Build incomplete
3. Cached old version

**Solutions:**
```bash
# Re-build Storybook
npm run build-storybook

# Verify build output
ls -la storybook-static/
cat storybook-static/index.html | grep "Storybook"

# Re-upload
./adapters/shared/storybook/upload-aws.sh -b bucket --invalidate --distribution-id id
```

### Test 3/4 Fails (Missing Files)

**Symptoms:**
- iframe.html or project.json returns 404

**Causes:**
1. Upload incomplete
2. Files excluded from upload
3. Wrong directory uploaded

**Solutions:**
```bash
# Check what was uploaded
aws s3 ls s3://bucket/ --recursive | grep -E "(iframe|project)"

# Re-upload with verbose
./adapters/shared/storybook/upload-aws.sh -b bucket --verbose
```

### Test 5 Fails (Assets Not Loading)

**Symptoms:**
- JS/CSS files return 404
- Assets not accessible

**Causes:**
1. Assets not uploaded
2. Wrong cache headers
3. CDN not serving assets

**Solutions:**
```bash
# Check asset files
aws s3 ls s3://bucket/ --recursive | grep ".js"

# Test asset directly
curl -I https://url/main.abc123.js

# Check cache headers
curl -I https://url/main.abc123.js | grep -i cache
```

### CDN Propagation Issues

**Symptoms:**
- Tests pass sometimes, fail other times
- Old content still visible

**Causes:**
1. CDN not fully propagated
2. Cache not invalidated
3. Multiple edge locations

**Solutions:**
```bash
# Wait longer
sleep 120

# Create invalidation
aws cloudfront create-invalidation --distribution-id id --paths "/*"
az cdn endpoint purge --resource-group rg --profile-name cdn --name endpoint --content-paths "/*"

# Check invalidation status
aws cloudfront get-invalidation --distribution-id id --id invalidation-id
```

## Best Practices

### Before Verification

1. ✅ Build Storybook successfully
2. ✅ Upload all files
3. ✅ Wait for CDN propagation (1-5 minutes)
4. ✅ Create cache invalidation if needed

### During Verification

1. ✅ Use verbose mode for debugging
2. ✅ Check all tests pass
3. ✅ Review any warnings
4. ✅ Test manually in browser

### After Verification

1. ✅ Only switch if all tests pass
2. ✅ Verify ACTIVE after switch
3. ✅ Monitor for errors
4. ✅ Keep BLUE available for rollback

### Automated Verification

1. ✅ Run in CI/CD pipeline
2. ✅ Block deployment on failures
3. ✅ Retry on transient failures
4. ✅ Alert on persistent failures

## Advanced Verification

### Performance Testing

```bash
# Measure page load time
time curl -s https://storybook.example.com/index.html > /dev/null

# Check asset sizes
curl -s https://storybook.example.com/index.html | wc -c

# Test from multiple locations
for region in us-east-1 eu-west-1 ap-southeast-1; do
  echo "Testing from $region..."
  # Use region-specific endpoint or VPN
done
```

### Smoke Testing

```bash
# Test specific components
./adapters/shared/storybook/verify.sh \
  -u https://storybook.example.com \
  --check-components \
  --verbose

# Test with different browsers (via Playwright/Selenium)
npx playwright test storybook-smoke.spec.ts
```

### Monitoring

```bash
# Set up health check endpoint
curl -f https://storybook.example.com/index.html || alert

# Monitor response times
while true; do
  time curl -s https://storybook.example.com/index.html > /dev/null
  sleep 60
done
```

## References

- [Deployment Guide](./deploy.md)
- [Upload Guide](./UPLOAD.md)
- [Switch Guide](./switch.md)
- [Main Documentation](../../../docs/STORYBOOK-HOSTING.md)

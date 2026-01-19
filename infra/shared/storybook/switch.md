# Blue/Green Switch Guide

This guide explains how to switch between blue and green Storybook deployments.

## Overview

The blue/green switch updates the active endpoint to point to a different environment:
- **Switch to GREEN** - Promote validated candidate to active
- **Rollback to BLUE** - Revert to previous stable version

## Prerequisites

- Infrastructure deployed via Terraform (AWS) or Bicep (Azure)
- GREEN environment validated and healthy
- Access to cloud provider credentials

## Switch Mechanisms

### AWS - CloudFront Origin Switch

**How it works:**
1. CloudFront distribution has origin pointing to BLUE bucket
2. Switch updates origin to point to GREEN bucket
3. CloudFront propagates change (1-5 minutes)
4. Traffic now flows to GREEN

**Commands:**

```bash
cd infra/aws/storybook/terraform

# Switch to GREEN
terraform apply -var="active_environment=green" -auto-approve

# Verify switch
terraform output storybook_url_active
```

**Manual switch (if needed):**
```bash
# Get distribution ID
DIST_ID=$(terraform output -raw cdn_distribution_id)

# Get GREEN bucket name
GREEN_BUCKET=$(terraform output -raw upload_target_green)

# Update CloudFront origin
aws cloudfront get-distribution-config --id ${DIST_ID} > dist-config.json

# Edit dist-config.json to change origin from blue to green bucket
# Then update:
aws cloudfront update-distribution \
  --id ${DIST_ID} \
  --distribution-config file://dist-config.json \
  --if-match $(jq -r '.ETag' dist-config.json)
```

### Azure - CDN Origin Switch

**How it works:**
1. CDN endpoint has origin pointing to BLUE storage account
2. Switch updates origin to point to GREEN storage account
3. CDN propagates change (1-5 minutes)
4. Traffic now flows to GREEN

**Commands:**

```bash
cd infra/azure/storybook/bicep

# Switch to GREEN
az deployment group create \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=green

# Verify switch
az deployment group show \
  --resource-group rg-ui-library-${ENVIRONMENT} \
  --name main \
  --query 'properties.outputs.storybookUrlActive.value'
```

**Manual switch (if needed):**
```bash
# Get CDN endpoint name
CDN_ENDPOINT="storybook"
CDN_PROFILE="cdn-profile"
RG="rg-ui-library-${ENVIRONMENT}"

# Get GREEN storage account
GREEN_ACCOUNT=$(az deployment group show \
  --resource-group ${RG} \
  --name main \
  --query 'properties.outputs.uploadTargetGreen.value' \
  --output tsv)

# Update CDN origin
az cdn endpoint update \
  --resource-group ${RG} \
  --profile-name ${CDN_PROFILE} \
  --name ${CDN_ENDPOINT} \
  --origin-host-header ${GREEN_ACCOUNT}.z13.web.core.windows.net
```

## Switch Workflow

### Pre-Switch Checklist

- [ ] GREEN environment deployed
- [ ] GREEN URL validated (index.html accessible)
- [ ] Storybook loads correctly on GREEN
- [ ] Key components render properly
- [ ] No console errors on GREEN
- [ ] Team notified of upcoming switch

### Switch Steps

1. **Record current state:**
   ```bash
   # Note current ACTIVE URL
   ACTIVE_URL=$(terraform output -raw storybook_url_active)
   echo "Current ACTIVE: ${ACTIVE_URL}"
   
   # Take screenshot or note version
   curl -s ${ACTIVE_URL}/project.json | jq '.version'
   ```

2. **Execute switch:**
   ```bash
   # AWS
   terraform apply -var="active_environment=green" -auto-approve
   
   # Azure
   az deployment group create ... --parameters activeEnvironment=green
   ```

3. **Wait for propagation:**
   ```bash
   # Wait 2-5 minutes for CDN propagation
   echo "Waiting for CDN propagation..."
   sleep 120
   ```

4. **Verify switch:**
   ```bash
   # Check ACTIVE URL now points to GREEN
   curl -I ${ACTIVE_URL}/index.html
   
   # Verify Storybook loads
   curl -s ${ACTIVE_URL}/index.html | grep -q "Storybook" && echo "✓ Switch successful"
   ```

5. **Monitor:**
   ```bash
   # Watch for errors in next 15 minutes
   # Check CDN metrics
   # Monitor user reports
   ```

### Post-Switch Verification

**Automated checks:**
```bash
#!/bin/bash
# verify-switch.sh

ACTIVE_URL=$1

echo "Verifying switch to GREEN..."

# Check HTTP status
STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${ACTIVE_URL}/index.html)
if [ "$STATUS" != "200" ]; then
  echo "✗ Failed: HTTP ${STATUS}"
  exit 1
fi

# Check Storybook content
if ! curl -s ${ACTIVE_URL}/index.html | grep -q "Storybook"; then
  echo "✗ Failed: Storybook not detected"
  exit 1
fi

# Check key assets
for asset in iframe.html project.json; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${ACTIVE_URL}/${asset})
  if [ "$STATUS" != "200" ]; then
    echo "✗ Failed: ${asset} returned ${STATUS}"
    exit 1
  fi
done

echo "✓ All checks passed"
```

**Manual verification:**
1. Open ACTIVE URL in browser
2. Verify Storybook loads
3. Check theme switching works
4. Test a few components
5. Check browser console for errors

## Rollback Procedure

### When to Rollback

- Storybook doesn't load on ACTIVE
- Critical functionality broken
- High error rate detected
- User reports of issues

### Rollback Steps

1. **Immediate rollback:**
   ```bash
   # AWS
   cd infra/aws/storybook/terraform
   terraform apply -var="active_environment=blue" -auto-approve
   
   # Azure
   cd infra/azure/storybook/bicep
   az deployment group create \
     --resource-group rg-ui-library-${ENVIRONMENT} \
     --template-file main.bicep \
     --parameters parameters.json \
     --parameters activeEnvironment=blue
   ```

2. **Verify rollback:**
   ```bash
   # Check ACTIVE URL now points to BLUE
   ACTIVE_URL=$(terraform output -raw storybook_url_active)
   curl -I ${ACTIVE_URL}/index.html
   
   # Verify old version is back
   curl -s ${ACTIVE_URL}/project.json | jq '.version'
   ```

3. **Notify team:**
   ```bash
   echo "Rollback completed. BLUE is now active."
   echo "GREEN remains available for debugging."
   ```

4. **Investigate GREEN:**
   ```bash
   # Access GREEN URL directly
   GREEN_URL=$(terraform output -raw storybook_url_green)
   
   # Debug issues
   curl -v ${GREEN_URL}/index.html
   
   # Check browser console
   # Review build logs
   # Compare with BLUE
   ```

### Rollback Timing

**Immediate rollback if:**
- ACTIVE URL returns 404/500
- Storybook completely broken
- Critical security issue

**Planned rollback if:**
- Minor visual issues
- Non-critical functionality broken
- Can wait for fix and re-deploy

## Advanced Scenarios

### Gradual Traffic Shift (AWS)

**Using CloudFront with weighted origins:**

```bash
# Not implemented in basic template
# Would require:
# 1. Two CloudFront distributions (blue and green)
# 2. Route53 weighted routing
# 3. Gradual weight adjustment

# Example:
# 90% to BLUE, 10% to GREEN
# 70% to BLUE, 30% to GREEN
# 50% to BLUE, 50% to GREEN
# 0% to BLUE, 100% to GREEN
```

### A/B Testing (Advanced)

**Using CloudFront Lambda@Edge:**

```javascript
// Not implemented in basic template
// Would require Lambda@Edge function to:
// 1. Read cookie/header
// 2. Route to blue or green based on criteria
// 3. Set cookie for consistency
```

### Scheduled Switch

**Using cron or GitHub Actions:**

```yaml
# .github/workflows/scheduled-switch.yml
name: Scheduled Switch to GREEN

on:
  schedule:
    - cron: '0 2 * * 1'  # 2 AM every Monday

jobs:
  switch:
    runs-on: ubuntu-latest
    steps:
      - name: Switch to GREEN
        run: |
          cd infra/aws/storybook/terraform
          terraform apply -var="active_environment=green" -auto-approve
```

## Monitoring During Switch

### Key Metrics

**Before switch:**
- Baseline error rate
- Baseline response time
- Baseline traffic volume

**During switch:**
- Monitor error rate (should stay < 1%)
- Monitor response time (should stay < 2s)
- Watch for 404/500 errors

**After switch:**
- Compare metrics to baseline
- Check for anomalies
- Monitor for 15-30 minutes

### CloudWatch Metrics (AWS)

```bash
# Get CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=${DIST_ID} \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### Azure Monitor Metrics

```bash
# Get CDN metrics
az monitor metrics list \
  --resource /subscriptions/${SUB_ID}/resourceGroups/${RG}/providers/Microsoft.Cdn/profiles/${CDN_PROFILE}/endpoints/${CDN_ENDPOINT} \
  --metric "RequestCount" \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S)
```

## Troubleshooting

### Switch Doesn't Take Effect

**Issue: Still seeing old version after switch**

**Causes:**
1. CDN cache not invalidated
2. Browser cache
3. DNS propagation delay

**Solutions:**
```bash
# 1. Create CDN invalidation
aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths "/*"

# 2. Hard refresh browser (Ctrl+Shift+R)

# 3. Wait for propagation (5-10 minutes)
```

### Switch Command Fails

**Issue: Terraform/Bicep apply fails**

**Causes:**
1. State lock
2. Permission issues
3. Resource conflicts

**Solutions:**
```bash
# 1. Check state lock
terraform force-unlock <lock-id>

# 2. Verify credentials
aws sts get-caller-identity
az account show

# 3. Review error message
terraform apply -var="active_environment=green"  # Read output carefully
```

### Partial Switch

**Issue: Some users see new version, some see old**

**Causes:**
1. CDN propagation in progress
2. Multiple CDN edge locations
3. DNS caching

**Solutions:**
1. Wait for full propagation (5-10 minutes)
2. Create invalidation to speed up
3. Verify all edge locations updated

## Best Practices

### Switch Timing

**Recommended:**
- Low-traffic periods (e.g., 2-4 AM)
- Not on Fridays or before holidays
- With team available for monitoring

**Avoid:**
- Peak traffic hours
- During incidents
- Without validation

### Communication

**Before switch:**
- Notify team of planned switch
- Share GREEN URL for preview
- Set monitoring alerts

**During switch:**
- Post status updates
- Monitor metrics actively
- Be ready to rollback

**After switch:**
- Confirm success
- Document any issues
- Update runbook if needed

### Documentation

**Record:**
- Switch timestamp
- Who performed switch
- Validation results
- Any issues encountered
- Rollback (if performed)

**Example log:**
```
2026-01-15 02:00 UTC - Switch initiated by CI/CD
2026-01-15 02:02 UTC - Terraform apply completed
2026-01-15 02:05 UTC - CDN propagation complete
2026-01-15 02:06 UTC - Validation passed
2026-01-15 02:15 UTC - Monitoring confirmed stable
2026-01-15 02:30 UTC - Switch successful, GREEN is now ACTIVE
```

## References

- [Deployment Guide](./deploy.md)
- [Main Documentation](../../../docs/STORYBOOK-HOSTING.md)
- [AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)
- [Azure CDN](https://docs.microsoft.com/en-us/azure/cdn/)

# Azure Storybook Hosting - Bicep

This directory contains Bicep templates for hosting Storybook on Azure using Storage Accounts and Azure CDN.

## Architecture

**Components:**
- **Storage Accounts** - Two accounts for blue/green deployment with static website hosting
- **Azure CDN (Optional)** - CDN for global distribution and HTTPS
- **Azure DNS (Optional)** - DNS for custom domain
- **RBAC** - Least privilege access control

**Blue/Green Strategy:**
- Two storage accounts: `storybookblue` and `storybookgreen`
- Each with static website hosting enabled
- CDN or DNS points to active storage account
- Switch by updating CDN origin or DNS record
- Rollback by reverting to previous configuration

## Prerequisites

- Azure CLI installed and logged in
- Bicep CLI installed
- Azure subscription with appropriate permissions
- Resource group created

## Quick Start

### 1. Login to Azure

```bash
az login
az account set --subscription "Your Subscription Name"
```

### 2. Create Resource Group

```bash
az group create \
  --name rg-ui-library-dev \
  --location eastus
```

### 3. Configure Parameters

Edit `parameters.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "projectName": {
      "value": "ui-library"
    },
    "environment": {
      "value": "dev"
    },
    "location": {
      "value": "eastus"
    }
  }
}
```

### 4. Deploy Infrastructure

```bash
az deployment group create \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json
```

### 5. Get Outputs

```bash
az deployment group show \
  --resource-group rg-ui-library-dev \
  --name main \
  --query properties.outputs
```

## Configuration

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `projectName` | Project identifier | `ui-library` |
| `environment` | Environment name | `dev`, `staging`, `prod` |
| `location` | Azure region | `eastus`, `westus2` |

### Optional Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `enableBlueGreen` | Enable blue/green deployment | `true` |
| `enableCdn` | Enable Azure CDN | `true` |
| `customDomainName` | Custom domain for Storybook | `null` |
| `dnsZoneResourceId` | Azure DNS zone resource ID | `null` |
| `retentionPolicyDays` | Log retention | `30` |
| `tags` | Resource tags | `{}` |

### Example Configurations

**Development:**
```json
{
  "projectName": { "value": "ui-library" },
  "environment": { "value": "dev" },
  "location": { "value": "eastus" },
  "enableCdn": { "value": false }
}
```

**Production:**
```json
{
  "projectName": { "value": "ui-library" },
  "environment": { "value": "prod" },
  "location": { "value": "eastus" },
  "enableBlueGreen": { "value": true },
  "enableCdn": { "value": true },
  "customDomainName": { "value": "storybook.example.com" },
  "tags": {
    "value": {
      "Project": "UI Library",
      "Environment": "Production",
      "ManagedBy": "Bicep"
    }
  }
}
```

## Outputs

| Output | Description |
|--------|-------------|
| `storybookUrlActive` | Current active URL |
| `storybookUrlBlue` | Blue environment URL |
| `storybookUrlGreen` | Green environment URL |
| `uploadTargetBlue` | Blue storage account name |
| `uploadTargetGreen` | Green storage account name |
| `cdnEndpointName` | CDN endpoint name |

## Deployment

### Upload to GREEN

```bash
# Get GREEN storage account
GREEN_ACCOUNT=$(az deployment group show \
  --resource-group rg-ui-library-dev \
  --name main \
  --query 'properties.outputs.uploadTargetGreen.value' \
  --output tsv)

# Upload Storybook
az storage blob upload-batch \
  --account-name ${GREEN_ACCOUNT} \
  --destination '$web' \
  --source ../../../../storybook-static/ \
  --overwrite
```

### Validate GREEN

```bash
GREEN_URL=$(az deployment group show \
  --resource-group rg-ui-library-dev \
  --name main \
  --query 'properties.outputs.storybookUrlGreen.value' \
  --output tsv)

curl -I ${GREEN_URL}/index.html
```

### Switch to GREEN

```bash
az deployment group create \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=green
```

### Rollback to BLUE

```bash
az deployment group create \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json \
  --parameters activeEnvironment=blue
```

## Maintenance

### Update Infrastructure

```bash
# Pull latest templates
git pull

# Review changes (what-if)
az deployment group what-if \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json

# Apply updates
az deployment group create \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json
```

### Destroy Infrastructure

```bash
az group delete --name rg-ui-library-dev --yes
```

**Warning:** This deletes the entire resource group and all resources.

## Troubleshooting

### Bicep Build Fails

**Issue:** Template syntax error

**Solution:**
```bash
# Validate Bicep file
az bicep build --file main.bicep

# Check for errors in output
```

### Deployment Fails with Permission Error

**Issue:** Insufficient Azure permissions

**Solution:**
```bash
# Verify logged in account
az account show

# Check required permissions:
# - Storage Account Contributor
# - CDN Contributor (if using CDN)
# - DNS Zone Contributor (if using custom domain)
```

### Static Website Not Accessible

**Issue:** 404 on storage account URL

**Solution:**
```bash
# Verify static website is enabled
az storage blob service-properties show \
  --account-name ${STORAGE_ACCOUNT} \
  --query 'staticWebsite'

# Check files are uploaded
az storage blob list \
  --account-name ${STORAGE_ACCOUNT} \
  --container-name '$web'
```

## Cost Estimates

**Development:**
- Storage: ~$0.01/month
- Data transfer: ~$0.50/month
- **Total: ~$1/month**

**Production (with CDN):**
- Storage: ~$0.01/month
- Azure CDN: ~$5-15/month
- DNS: ~$0.50/month
- **Total: ~$5-20/month**

## Security

### RBAC Permissions

**Deployment (Bicep):**
- Storage Account Contributor
- CDN Contributor (if enabled)
- DNS Zone Contributor (if custom domain)

**CI/CD Upload:**
- Storage Blob Data Contributor (specific to storage account)
- No CDN permissions needed
- No DNS permissions needed

### Storage Security

- HTTPS required for all access
- Static website hosting with public read
- No public write access
- Encryption at rest enabled

## References

- [Main Documentation](../../../../docs/STORYBOOK-HOSTING.md)
- [Deployment Guide](../../../shared/storybook/deploy.md)
- [Switch Guide](../../../shared/storybook/switch.md)
- [Azure Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)

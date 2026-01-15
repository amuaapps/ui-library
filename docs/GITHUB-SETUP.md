# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions for automated library publishing and Storybook deployment.

## Overview

The workflow automatically:
1. **Tests** - Runs linter, tests, and type checking
2. **Builds** - Builds library and Storybook
3. **Publishes** - Publishes library to NPM (only if version bumped)
4. **Deploys** - Deploys Storybook to cloud (Azure or AWS)
5. **Switches** - Verifies and switches to GREEN environment

## Cloud Provider Detection

The workflow automatically detects which cloud provider to use based on configured environment variables:
- **Azure**: If `AZURE_SUBSCRIPTION_ID` and `AZURE_TENANT_ID` are set
- **AWS**: If `AWS_REGION` and `AWS_ROLE_ARN` are set

You only need to configure **one** cloud provider.

---

## Option 1: Azure Setup (Recommended)

### Prerequisites

1. Azure subscription
2. Azure CLI installed locally
3. Permissions to create service principals

### Step 1: Create Azure Service Principal for OIDC

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Get subscription and tenant IDs
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
TENANT_ID=$(az account show --query tenantId --output tsv)

echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Tenant ID: $TENANT_ID"

# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "github-ui-library" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --sdk-auth

# Note the output, especially the clientId
```

### Step 2: Configure Federated Credentials

```bash
# Get the application ID
APP_ID=$(az ad sp list --display-name "github-ui-library" --query "[0].appId" --output tsv)

# Create federated credential for main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_ORG/ui-library:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Create federated credential for staging branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-staging",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_ORG/ui-library:ref:refs/heads/staging",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Create federated credential for dev branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-dev",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_ORG/ui-library:ref:refs/heads/dev",
    "audiences": ["api://AzureADTokenExchange"]
  }'

echo "Client ID: $APP_ID"
```

**Replace `YOUR_ORG/ui-library` with your actual GitHub repository path.**

### Step 3: Configure GitHub Variables

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **Variables**

Add the following **Repository Variables**:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `AZURE_CLIENT_ID` | Client ID from Step 2 | `12345678-1234-1234-1234-123456789abc` |
| `AZURE_TENANT_ID` | Tenant ID from Step 1 | `87654321-4321-4321-4321-cba987654321` |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID from Step 1 | `abcdef12-3456-7890-abcd-ef1234567890` |
| `AZURE_REGION` | Azure region | `eastus` |
| `AZURE_RESOURCE_GROUP_NAME` | Resource group name (optional) | `rg-ui-library-prod` |

**Optional Variables:**

| Variable Name | Value | When to Use |
|---------------|-------|-------------|
| `AZURE_CUSTOM_DOMAIN` | Custom domain | `storybook.yourdomain.com` |
| `AZURE_DNS_ZONE_ID` | DNS zone resource ID | When using custom domain |

### Step 4: Configure GitHub Secrets

Go to **Secrets** tab and add:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `NPM_TOKEN` | NPM access token | https://www.npmjs.com/settings/tokens |

### Step 5: Configure Environments (Optional)

For environment-specific approvals:

1. Go to **Settings** → **Environments**
2. Create environments: `dev`, `staging`, `prod`
3. For `prod`, add **Required reviewers**
4. For `staging` and `prod`, add **Wait timer** (optional)

---

## Option 2: AWS Setup

### Prerequisites

1. AWS account
2. AWS CLI installed locally
3. Permissions to create IAM roles

### Step 1: Create IAM Role for OIDC

Create a file `github-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/ui-library:*"
        }
      }
    }
  ]
}
```

**Replace:**
- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_ORG/ui-library` with your GitHub repository path

### Step 2: Create OIDC Provider (if not exists)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Step 3: Create IAM Role

```bash
# Create the role
aws iam create-role \
  --role-name GitHubActionsUILibrary \
  --assume-role-policy-document file://github-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name GitHubActionsUILibrary \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsUILibrary \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Get role ARN
aws iam get-role \
  --role-name GitHubActionsUILibrary \
  --query 'Role.Arn' \
  --output text
```

### Step 4: Configure GitHub Variables

Add the following **Repository Variables**:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `AWS_ROLE_ARN` | Role ARN from Step 3 | `arn:aws:iam::123456789012:role/GitHubActionsUILibrary` |
| `AWS_REGION` | AWS region | `us-east-1` |

**Optional Variables:**

| Variable Name | Value | When to Use |
|---------------|-------|-------------|
| `AWS_CUSTOM_DOMAIN` | Custom domain | `storybook.yourdomain.com` |
| `AWS_ROUTE53_ZONE_ID` | Route53 zone ID | When using custom domain |

### Step 5: Configure GitHub Secrets

Same as Azure setup - add `NPM_TOKEN`.

---

## Workflow Triggers

### Automatic Triggers

- **Push to `main`** → Deploys to `prod` environment
- **Push to `staging`** → Deploys to `staging` environment
- **Push to `dev`** → Deploys to `dev` environment

### Manual Trigger

1. Go to **Actions** tab
2. Select **Publish Library & Deploy Storybook**
3. Click **Run workflow**
4. Choose environment
5. Optionally force library publish

---

## Library Publishing Logic

The workflow automatically detects if the library version was bumped:

### Version Bump Detection

```bash
# Compare package.json version with previous commit
# If version changed: Publish to NPM
# If version unchanged: Skip publish, only deploy Storybook
```

### How to Publish a New Library Version

1. **Bump version** in `package.json`:
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "chore: bump version to 1.2.3"
   git push
   ```

3. **Workflow automatically**:
   - Detects version change
   - Publishes to NPM
   - Deploys Storybook
   - Creates git tag (for prod)

### Deploy Storybook Only (No Library Publish)

Just push code changes without bumping version:
```bash
git add .
git commit -m "docs: update component documentation"
git push
```

Workflow will:
- Skip NPM publish
- Deploy updated Storybook

---

## Environment-Specific Configuration

### Development (`dev` branch)

- **Auto-deploy**: Yes
- **Approval required**: No
- **Resource group**: `rg-ui-library-dev`
- **Domain**: Azure/AWS generated URL

### Staging (`staging` branch)

- **Auto-deploy**: Yes
- **Approval required**: Optional
- **Resource group**: `rg-ui-library-staging`
- **Domain**: Azure/AWS generated URL or custom

### Production (`main` branch)

- **Auto-deploy**: Yes
- **Approval required**: Recommended
- **Resource group**: `rg-ui-library-prod`
- **Domain**: Custom domain recommended
- **Git tag**: Created on library publish

---

## Workflow Steps Explained

### 1. Test Job

```yaml
- Run linter (npm run lint)
- Run tests (npm test)
- Run type check (npm run type-check)
```

**Fails if**: Any test, lint, or type error

### 2. Build Job

```yaml
- Detect environment (from branch or manual input)
- Check if version bumped
- Build library (npm run build)
- Build Storybook (npm run build-storybook)
- Upload artifacts
```

**Outputs**: `version_changed`, `current_version`, `environment`

### 3. Publish Job (Conditional)

```yaml
- Only runs if version changed OR force_publish = true
- Download library artifacts
- Publish to NPM
- Create git tag (prod only)
```

**Skipped if**: Version unchanged and not forced

### 4. Deploy Job

```yaml
- Download Storybook artifacts
- Detect cloud provider (Azure or AWS)
- Deploy infrastructure (Bicep or Terraform)
- Upload Storybook to GREEN environment
```

**Creates**: Infrastructure + GREEN deployment

### 5. Switch Job

```yaml
- Wait 60s for CDN propagation
- Verify GREEN deployment
- Switch active environment to GREEN
```

**Fails if**: Verification fails

---

## Monitoring Deployments

### View Workflow Runs

1. Go to **Actions** tab
2. Click on workflow run
3. View job logs

### Check Deployment Status

Each job shows:
- ✅ Success
- ❌ Failure
- ⏸️ Waiting for approval

### Deployment Summary

At the end of successful run:
- Environment
- Cloud provider
- Storybook URL
- Library version (if published)

---

## Troubleshooting

### "No cloud provider configured"

**Cause**: Neither Azure nor AWS variables are set

**Fix**: Configure Azure or AWS variables (see setup sections above)

### "Azure login failed"

**Cause**: OIDC credentials incorrect or federated credential not configured

**Fix**:
1. Verify `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
2. Check federated credentials exist for your repository
3. Ensure service principal has contributor role

### "AWS assume role failed"

**Cause**: IAM role not configured or trust policy incorrect

**Fix**:
1. Verify `AWS_ROLE_ARN` is correct
2. Check trust policy includes your repository
3. Ensure OIDC provider exists

### "NPM publish failed"

**Cause**: Invalid NPM token or package name conflict

**Fix**:
1. Verify `NPM_TOKEN` is valid
2. Check package name is available
3. Ensure you have publish permissions

### "Verification failed"

**Cause**: Storybook not accessible or CDN not propagated

**Fix**:
1. Check deployment logs
2. Wait longer for CDN propagation
3. Verify infrastructure deployed correctly
4. Check storage/bucket permissions

---

## Security Best Practices

### ✅ Do

- Use OIDC authentication (no long-lived credentials)
- Configure environment protection rules for prod
- Use separate service principals/roles per environment
- Regularly rotate NPM tokens
- Review workflow logs for sensitive data

### ❌ Don't

- Commit credentials to repository
- Use personal access tokens
- Skip environment approvals for prod
- Grant excessive IAM permissions
- Disable security scanning

---

## Cost Optimization

### Development Environment

- Use minimal infrastructure
- Disable CDN if not needed
- Set short retention policies
- Delete when not in use

### Production Environment

- Enable CDN for performance
- Use custom domain
- Set appropriate retention
- Monitor costs regularly

---

## Next Steps

1. ✅ Configure cloud provider (Azure or AWS)
2. ✅ Set up GitHub variables and secrets
3. ✅ Configure environments (optional)
4. ✅ Test workflow with dev branch
5. ✅ Verify Storybook deployment
6. ✅ Set up production with approvals

---

## Support

### Documentation
- [Main README](../README.md)
- [Adapters Guide](../adapters/README.md)
- [Verification Checklist](../adapters/VERIFICATION-CHECKLIST.md)

### Common Issues
- [Troubleshooting Guide](../adapters/shared/storybook/UPLOAD.md#troubleshooting)
- [Linting Guide](../adapters/LINTING.md)

### GitHub Actions
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Azure OIDC Setup](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure)
- [AWS OIDC Setup](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

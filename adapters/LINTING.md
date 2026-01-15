# Infrastructure Linting and Security Checks

This document explains the linting and security scanning tools configured for infrastructure templates.

## Overview

Infrastructure code is validated through multiple layers:

1. **Syntax Validation** - Terraform/Bicep syntax checking
2. **Linting** - Code quality and best practices (TFLint/Bicep linter)
3. **Security Scanning** - Vulnerability and misconfiguration detection (Checkov)
4. **Plan Validation** - Dry-run deployment testing

## Tools

### AWS (Terraform)

**Required:**
- `terraform` - Syntax validation and planning
- `terraform fmt` - Code formatting

**Optional (Recommended):**
- `tflint` - Terraform linting
- `checkov` - Security scanning

### Azure (Bicep)

**Required:**
- `az` (Azure CLI) - Bicep compilation
- `az bicep` - Bicep linting

**Optional (Recommended):**
- `checkov` - Security scanning

## Installation

### Terraform Tools

```bash
# Terraform (required)
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# TFLint (optional)
# macOS
brew install tflint

# Linux
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# Checkov (optional)
pip install checkov
```

### Azure Tools

```bash
# Azure CLI (required)
# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Bicep (required, via Azure CLI)
az bicep install

# Checkov (optional)
pip install checkov
```

## Running Checks

### AWS Terraform

**Using the lint script:**
```bash
cd adapters/aws/storybook/terraform
./lint.sh
```

**Manual checks:**
```bash
# 1. Format check
terraform fmt -check -recursive

# 2. Validate
terraform init -backend=false
terraform validate

# 3. TFLint (if installed)
tflint --init
tflint

# 4. Checkov (if installed)
checkov -d . --config-file .checkov.yml

# 5. Plan (if tfvars exists)
terraform plan
```

### Azure Bicep

**Using the lint script:**
```bash
cd adapters/azure/storybook/bicep
./lint.sh
```

**Manual checks:**
```bash
# 1. Build
az bicep build --file main.bicep

# 2. Lint
az bicep lint --file main.bicep

# 3. Checkov (if installed)
az bicep build --file main.bicep --outfile main.json
checkov -f main.json --framework arm
rm main.json

# 4. What-if (if logged in and RG exists)
az deployment group what-if \
  --resource-group rg-ui-library-dev \
  --template-file main.bicep \
  --parameters parameters.json
```

## Configuration Files

### Terraform

**`.tflint.hcl`** - TFLint configuration
```hcl
config {
  module = true
  force = false
}

plugin "aws" {
  enabled = true
  version = "0.29.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

plugin "terraform" {
  enabled = true
  version = "0.5.0"
  source  = "github.com/terraform-linters/tflint-ruleset-terraform"
}
```

**`.checkov.yml`** - Checkov configuration
```yaml
directory:
  - .

framework:
  - terraform

skip-check:
  - CKV_AWS_18  # S3 bucket logging
  - CKV_AWS_68  # CloudFront geo restriction
```

### Bicep

**`bicepconfig.json`** - Bicep linter configuration
```json
{
  "analyzers": {
    "core": {
      "enabled": true,
      "rules": {
        "outputs-should-not-contain-secrets": {
          "level": "error"
        },
        "secure-parameter-default": {
          "level": "error"
        }
      }
    }
  }
}
```

## Checks Performed

### Terraform Checks

**1. Format Check (`terraform fmt`)**
- Validates consistent formatting
- Checks indentation and spacing
- Ensures canonical style

**2. Validation (`terraform validate`)**
- Syntax correctness
- Resource type validation
- Variable/output references
- Provider configuration

**3. TFLint**
- AWS-specific best practices
- Resource naming conventions
- Deprecated syntax
- Unused variables/outputs
- Documentation completeness

**4. Checkov**
- Security misconfigurations
- Encryption settings
- Public access controls
- IAM policies
- Network security

**5. Plan**
- Resource creation preview
- Dependency validation
- Variable interpolation
- Provider API validation

### Bicep Checks

**1. Build (`az bicep build`)**
- Syntax correctness
- Resource type validation
- Parameter/output references
- Expression evaluation

**2. Lint (`az bicep lint`)**
- Best practices
- Naming conventions
- Unused parameters/variables
- Security warnings
- Hardcoded values

**3. Checkov**
- Security misconfigurations
- Encryption settings
- Public access controls
- RBAC policies
- Network security

**4. What-if (`az deployment group what-if`)**
- Resource changes preview
- Dependency validation
- Parameter validation
- Azure API validation

## Security Rules

### Critical (Must Pass)

**Terraform:**
- ✅ S3 buckets must have public access blocked (when using CDN)
- ✅ CloudFront must use HTTPS
- ✅ S3 encryption must be enabled
- ✅ CloudFront must use TLS 1.2+

**Bicep:**
- ✅ Storage accounts must use HTTPS only
- ✅ Storage accounts must use TLS 1.2+
- ✅ Storage encryption must be enabled
- ✅ Outputs must not contain secrets

### Warnings (Should Fix)

**Terraform:**
- ⚠️ Variables should be documented
- ⚠️ Outputs should be documented
- ⚠️ Resources should follow naming conventions
- ⚠️ Unused variables should be removed

**Bicep:**
- ⚠️ Parameters should not have hardcoded defaults
- ⚠️ Prefer interpolation over concatenation
- ⚠️ Unused parameters should be removed
- ⚠️ Location should be parameterized

### Skipped (Intentional)

**Terraform:**
- S3 bucket logging (not required for static sites)
- CloudFront WAF (not required for documentation)
- CloudFront geo restrictions (public documentation)
- S3 MFA delete (not required for dev)

**Bicep:**
- Hardcoded location (acceptable when using `resourceGroup().location`)
- Explicit location parameters (we use resource group location)

## CI/CD Integration

### GitHub Actions - Terraform

```yaml
name: Terraform Lint

on:
  pull_request:
    paths:
      - 'adapters/aws/**/*.tf'
      - 'adapters/aws/**/*.hcl'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0
      
      - name: Terraform Format
        run: terraform fmt -check -recursive
        working-directory: adapters/aws/storybook/terraform
      
      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: adapters/aws/storybook/terraform
      
      - name: Terraform Validate
        run: terraform validate
        working-directory: adapters/aws/storybook/terraform
      
      - name: Setup TFLint
        uses: terraform-linters/setup-tflint@v4
        with:
          tflint_version: v0.50.0
      
      - name: Run TFLint
        run: |
          tflint --init
          tflint
        working-directory: adapters/aws/storybook/terraform
      
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: adapters/aws/storybook/terraform
          config_file: adapters/aws/storybook/terraform/.checkov.yml
          soft_fail: false
```

### GitHub Actions - Bicep

```yaml
name: Bicep Lint

on:
  pull_request:
    paths:
      - 'adapters/azure/**/*.bicep'
      - 'adapters/azure/**/*.json'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Bicep Build
        run: az bicep build --file main.bicep
        working-directory: adapters/azure/storybook/bicep
      
      - name: Bicep Lint
        run: az bicep lint --file main.bicep
        working-directory: adapters/azure/storybook/bicep
      
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: adapters/azure/storybook/bicep
          framework: bicep
          soft_fail: false
```

## Troubleshooting

### TFLint Plugin Download Fails

**Issue:** Cannot download AWS plugin

**Solution:**
```bash
# Manual plugin installation
mkdir -p ~/.tflint.d/plugins
cd ~/.tflint.d/plugins
wget https://github.com/terraform-linters/tflint-ruleset-aws/releases/download/v0.29.0/tflint-ruleset-aws_linux_amd64.zip
unzip tflint-ruleset-aws_linux_amd64.zip
```

### Checkov False Positives

**Issue:** Checkov flags intentional design decisions

**Solution:** Add to skip list in `.checkov.yml`:
```yaml
skip-check:
  - CKV_AWS_18  # Add check ID to skip
```

### Bicep Lint Warnings

**Issue:** Bicep linter shows warnings

**Solution:** 
1. Fix the warning if it's a real issue
2. Adjust rule level in `bicepconfig.json`:
```json
{
  "analyzers": {
    "core": {
      "rules": {
        "rule-name": {
          "level": "off"
        }
      }
    }
  }
}
```

### Terraform Plan Fails

**Issue:** Plan fails without tfvars

**Solution:**
```bash
# Create tfvars from example
cp terraform.tfvars.example terraform.tfvars
# Edit with your values
vim terraform.tfvars
```

## Best Practices

### Before Committing

1. ✅ Run lint script locally
2. ✅ Fix all errors
3. ✅ Review warnings
4. ✅ Test with dry-run/what-if
5. ✅ Document any skipped checks

### In CI/CD

1. ✅ Run on every PR
2. ✅ Block merge on failures
3. ✅ Allow warnings (but review)
4. ✅ Cache tool installations
5. ✅ Report results in PR comments

### Security

1. ✅ Never skip security checks without justification
2. ✅ Document all skipped checks
3. ✅ Review security warnings carefully
4. ✅ Update tools regularly
5. ✅ Follow least privilege principle

## Tool Versions

**Recommended versions (as of 2026-01-15):**

| Tool | Version | Update Frequency |
|------|---------|------------------|
| Terraform | 1.6.0+ | Quarterly |
| TFLint | 0.50.0+ | Monthly |
| Checkov | Latest | Weekly |
| Azure CLI | Latest | Monthly |
| Bicep | Latest | Monthly |

**Update commands:**
```bash
# Terraform
brew upgrade terraform

# TFLint
tflint --version
brew upgrade tflint

# Checkov
pip install --upgrade checkov

# Azure CLI
az upgrade

# Bicep
az bicep upgrade
```

## References

- [TFLint Documentation](https://github.com/terraform-linters/tflint)
- [Checkov Documentation](https://www.checkov.io/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Bicep Best Practices](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
- [Azure Security Best Practices](https://learn.microsoft.com/en-us/azure/security/)

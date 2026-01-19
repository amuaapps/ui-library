# Infrastructure Adapter Interface Specification

This document defines the consistent interface that all infrastructure adapters must implement for Storybook hosting.

## Version

**Specification Version:** v1.0.0  
**Last Updated:** January 15, 2026

## Purpose

This interface ensures that AWS and Azure adapters expose consistent parameters and outputs, enabling:
- Cloud-agnostic CI/CD pipelines
- Easy switching between cloud providers
- Predictable deployment workflows
- Standardized documentation

## Required Inputs

All adapters MUST accept these minimum input parameters:

### `project_name` (string)

**Description:** Project identifier used for resource naming.

**Purpose:** Creates unique, identifiable resource names across environments.

**Format:**
- Lowercase alphanumeric and hyphens only
- 3-20 characters
- Must start with a letter

**Examples:**
```
ui-library
design-system
component-lib
```

**Used in:**
- S3 bucket names: `storybook-blue-{project_name}-{environment}`
- Storage account names: `sb{project_name}{environment}blue`
- CloudFront distribution tags
- Resource group names

---

### `environment` (string)

**Description:** Environment name for deployment isolation.

**Purpose:** Separates dev, staging, and production resources.

**Allowed Values:**
- `dev` - Development environment
- `staging` - Staging/pre-production environment
- `prod` - Production environment

**Examples:**
```
dev
staging
prod
```

**Used in:**
- Resource naming
- Tag values
- Configuration selection (e.g., CDN enabled in prod)

---

### `region` / `location` (string)

**Description:** Cloud provider region for resource deployment.

**Purpose:** Determines physical location of resources.

**AWS Parameter Name:** `region`

**AWS Examples:**
```
us-east-1
us-west-2
eu-west-1
ap-southeast-1
```

**Azure Parameter Name:** `location`

**Azure Examples:**
```
eastus
westus2
westeurope
southeastasia
```

**Used in:**
- Resource creation location
- CDN origin configuration
- Latency optimization

---

## Optional Inputs

Adapters SHOULD support these optional parameters with specified defaults:

### `enable_blue_green` (boolean)

**Description:** Enable blue/green deployment strategy.

**Default:**
- `true` for `prod` environment
- `true` for `staging` environment (recommended)
- `false` for `dev` environment (optional, to save costs)

**When `true`:**
- Creates two separate environments (blue and green)
- Enables safe validation before switching
- Supports instant rollback

**When `false`:**
- Creates single environment
- Direct deployment (no validation step)
- Lower cost but higher risk

**Examples:**
```hcl
# Terraform
enable_blue_green = true

# Bicep
"enableBlueGreen": { "value": true }
```

---

### `enable_cdn` (boolean)

**Description:** Enable CDN for global distribution.

**Default:**
- `true` for `prod` environment
- `true` for `staging` environment (recommended)
- `false` for `dev` environment (optional, to save costs)

**When `true`:**
- Creates CloudFront distribution (AWS) or Azure CDN endpoint
- Enables HTTPS
- Improves global performance
- Increases cost (~$5-15/month)

**When `false`:**
- Uses direct storage URL
- HTTP only (AWS) or HTTPS (Azure static website)
- Slower for global users
- Lower cost (~$1/month)

**Examples:**
```hcl
# Terraform
enable_cdn = true

# Bicep
"enableCdn": { "value": true }
```

---

### `custom_domain_name` (string, nullable)

**Description:** Custom domain name for Storybook.

**Default:** `null` (uses cloud-provided URL)

**Format:**
- Valid DNS hostname
- Must own domain and have DNS access

**Examples:**
```
storybook.example.com
docs.ui-library.com
components.mycompany.com
```

**Requirements:**
- DNS zone must exist (Route53 or Azure DNS)
- Certificate management (automatic via CloudFront or Azure CDN)
- `dns_zone_id` / `dns_zone_resource_id` must be provided

**When `null`:**
- Uses CloudFront URL: `https://d111111abcdef8.cloudfront.net`
- Or Azure static website URL: `https://storageaccount.z13.web.core.windows.net`

---

### `dns_zone_id` / `dns_zone_resource_id` (string, nullable)

**Description:** DNS zone identifier for custom domain.

**Default:** `null`

**AWS Parameter Name:** `route53_zone_id`

**AWS Format:**
```
Z1234567890ABC
```

**AWS Example:**
```hcl
route53_zone_id = "Z1234567890ABC"
```

**Azure Parameter Name:** `dns_zone_resource_id`

**Azure Format:**
```
/subscriptions/{subscription-id}/resourceGroups/{rg}/providers/Microsoft.Network/dnszones/{zone-name}
```

**Azure Example:**
```json
{
  "dnsZoneResourceId": {
    "value": "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/rg-dns/providers/Microsoft.Network/dnszones/example.com"
  }
}
```

**Required when:** `custom_domain_name` is provided

---

### `retention_policy_days` (number)

**Description:** Number of days to retain access logs.

**Default:** `30`

**Range:** `1` to `365`

**Purpose:** Compliance and audit requirements.

**Examples:**
```hcl
# Terraform
retention_policy_days = 90

# Bicep
"retentionPolicyDays": { "value": 90 }
```

**Applies to:**
- S3 access logs (AWS)
- Storage account logs (Azure)
- CloudFront logs (AWS)
- CDN logs (Azure)

---

### `tags` / `resource_tags` (map/object)

**Description:** Key-value pairs for resource tagging.

**Default:** `{}`

**Purpose:**
- Cost tracking
- Resource organization
- Compliance requirements

**AWS Parameter Name:** `tags`

**AWS Example:**
```hcl
tags = {
  Project     = "UI Library"
  Environment = "Production"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
  Owner       = "platform-team@example.com"
}
```

**Azure Parameter Name:** `tags`

**Azure Example:**
```json
{
  "tags": {
    "value": {
      "Project": "UI Library",
      "Environment": "Production",
      "ManagedBy": "Bicep",
      "CostCenter": "Engineering",
      "Owner": "platform-team@example.com"
    }
  }
}
```

---

## Required Outputs

All adapters MUST expose these outputs:

### `storybook_url_active` (string)

**Description:** The current active Storybook URL that users should access.

**Purpose:** Single source of truth for the active deployment.

**Format:**
- Full HTTPS URL (when CDN enabled)
- Full HTTP/HTTPS URL (when CDN disabled)

**Examples:**
```
https://d111111abcdef8.cloudfront.net
https://storybook.example.com
https://storageaccount.z13.web.core.windows.net
```

**Behavior:**
- Points to BLUE by default
- Points to GREEN after switch
- Updates automatically when switching environments

**Usage:**
```yaml
# CI/CD verification
- name: Verify active deployment
  run: curl -f ${{ steps.infra.outputs.storybook_url_active }}/index.html
```

---

### `storybook_url_blue` (string)

**Description:** Direct URL to the BLUE environment.

**Purpose:** Access BLUE environment directly for validation or rollback.

**Format:** Full URL

**Examples:**
```
https://storybook-blue-ui-library-prod.s3-website-us-east-1.amazonaws.com
https://sbblue.z13.web.core.windows.net
```

**Usage:**
```bash
# Verify BLUE is still healthy
curl -I ${BLUE_URL}/index.html
```

---

### `storybook_url_green` (string)

**Description:** Direct URL to the GREEN environment.

**Purpose:** Access GREEN environment for validation before switching.

**Format:** Full URL

**Examples:**
```
https://storybook-green-ui-library-prod.s3-website-us-east-1.amazonaws.com
https://sbgreen.z13.web.core.windows.net
```

**Usage:**
```yaml
# Validate GREEN before switch
- name: Validate GREEN
  run: curl -f ${{ steps.infra.outputs.storybook_url_green }}/index.html
```

---

### `upload_target_blue` (string)

**Description:** Upload destination for BLUE environment.

**Purpose:** CI/CD knows where to upload Storybook files for BLUE.

**AWS Format:** S3 bucket name (without `s3://` prefix)
```
storybook-blue-ui-library-prod
```

**Azure Format:** Storage account name
```
sbuilibraryblue
```

**Usage:**
```bash
# AWS
aws s3 sync storybook-static/ s3://${BLUE_TARGET}/ --delete

# Azure
az storage blob upload-batch \
  --account-name ${BLUE_TARGET} \
  --destination '$web' \
  --source storybook-static/
```

---

### `upload_target_green` (string)

**Description:** Upload destination for GREEN environment.

**Purpose:** CI/CD knows where to upload Storybook files for GREEN.

**Format:** Same as `upload_target_blue`

**AWS Example:**
```
storybook-green-ui-library-prod
```

**Azure Example:**
```
sbuilibrarygreen
```

**Usage:**
```yaml
- name: Upload to GREEN
  run: |
    aws s3 sync storybook-static/ s3://${{ steps.infra.outputs.upload_target_green }}/ --delete
```

---

### `cdn_distribution_id` (string, nullable)

**Description:** CDN distribution identifier (when CDN is enabled).

**Purpose:** Create cache invalidations or update CDN configuration.

**AWS Format:** CloudFront distribution ID
```
E1234567890ABC
```

**Azure Format:** CDN endpoint name
```
storybook-endpoint
```

**When `null`:** CDN is not enabled

**Usage:**
```bash
# AWS: Create invalidation
aws cloudfront create-invalidation \
  --distribution-id ${CDN_ID} \
  --paths "/*"

# Azure: Purge cache
az cdn endpoint purge \
  --resource-group rg-ui-library-prod \
  --profile-name cdn-profile \
  --name ${CDN_ID} \
  --content-paths "/*"
```

---

## Optional Outputs

Adapters MAY expose these additional outputs:

### `resource_group_name` (string, Azure only)

**Description:** Azure resource group name.

**Purpose:** Reference for other Azure operations.

**Example:**
```
rg-ui-library-prod
```

---

### `blue_bucket_arn` / `green_bucket_arn` (string, AWS only)

**Description:** S3 bucket ARNs for IAM policy creation.

**Purpose:** Grant specific permissions to CI/CD.

**Example:**
```
arn:aws:s3:::storybook-blue-ui-library-prod
```

---

### `cdn_url` (string)

**Description:** CDN-specific URL (may differ from active URL).

**Purpose:** Direct CDN access for debugging.

**Example:**
```
https://d111111abcdef8.cloudfront.net
```

---

## Interface Compliance

### Validation Checklist

An adapter is compliant if it:

- [ ] Accepts all required inputs
- [ ] Supports all optional inputs with specified defaults
- [ ] Exposes all required outputs
- [ ] Output formats match specification
- [ ] Parameter names follow naming conventions
- [ ] Documentation includes all parameters
- [ ] Examples demonstrate all features

### Naming Conventions

**Terraform (AWS):**
- Use snake_case for variables: `project_name`, `enable_cdn`
- Use snake_case for outputs: `storybook_url_active`

**Bicep (Azure):**
- Use camelCase for parameters: `projectName`, `enableCdn`
- Use camelCase for outputs: `storybookUrlActive`

**Consistency:**
- Same logical parameter across clouds
- Different naming convention per tool
- Same semantic meaning

### Testing Compliance

```bash
# Test required inputs
terraform plan -var="project_name=test" -var="environment=dev" -var="region=us-east-1"

# Test optional inputs
terraform plan -var="enable_cdn=false" -var="enable_blue_green=true"

# Verify outputs
terraform output storybook_url_active
terraform output upload_target_green
```

## Examples

### Minimal Configuration (Dev)

**AWS Terraform:**
```hcl
project_name = "ui-library"
environment  = "dev"
region       = "us-east-1"
```

**Azure Bicep:**
```json
{
  "projectName": { "value": "ui-library" },
  "environment": { "value": "dev" },
  "location": { "value": "eastus" }
}
```

**Expected Outputs:**
- `storybook_url_active`: Cloud-provided URL
- `storybook_url_blue`: Direct blue URL
- `storybook_url_green`: Direct green URL
- `upload_target_blue`: Bucket/account name
- `upload_target_green`: Bucket/account name
- `cdn_distribution_id`: null (CDN disabled by default in dev)

---

### Full Configuration (Production)

**AWS Terraform:**
```hcl
project_name        = "ui-library"
environment         = "prod"
region              = "us-east-1"
enable_blue_green   = true
enable_cdn          = true
custom_domain_name  = "storybook.example.com"
route53_zone_id     = "Z1234567890ABC"
retention_policy_days = 90

tags = {
  Project     = "UI Library"
  Environment = "Production"
  ManagedBy   = "Terraform"
}
```

**Azure Bicep:**
```json
{
  "projectName": { "value": "ui-library" },
  "environment": { "value": "prod" },
  "location": { "value": "eastus" },
  "enableBlueGreen": { "value": true },
  "enableCdn": { "value": true },
  "customDomainName": { "value": "storybook.example.com" },
  "dnsZoneResourceId": {
    "value": "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/rg-dns/providers/Microsoft.Network/dnszones/example.com"
  },
  "retentionPolicyDays": { "value": 90 },
  "tags": {
    "value": {
      "Project": "UI Library",
      "Environment": "Production",
      "ManagedBy": "Bicep"
    }
  }
}
```

**Expected Outputs:**
- `storybook_url_active`: `https://storybook.example.com`
- `storybook_url_blue`: Direct blue URL
- `storybook_url_green`: Direct green URL
- `upload_target_blue`: Bucket/account name
- `upload_target_green`: Bucket/account name
- `cdn_distribution_id`: Distribution/endpoint ID

---

## CI/CD Integration

### Using Outputs in GitHub Actions

```yaml
- name: Deploy Infrastructure
  id: infra
  run: |
    cd infra/aws/storybook/terraform
    terraform apply -auto-approve
    echo "active_url=$(terraform output -raw storybook_url_active)" >> $GITHUB_OUTPUT
    echo "green_target=$(terraform output -raw upload_target_green)" >> $GITHUB_OUTPUT
    echo "green_url=$(terraform output -raw storybook_url_green)" >> $GITHUB_OUTPUT

- name: Upload to GREEN
  run: |
    aws s3 sync storybook-static/ s3://${{ steps.infra.outputs.green_target }}/ --delete

- name: Validate GREEN
  run: |
    curl -f ${{ steps.infra.outputs.green_url }}/index.html

- name: Switch to GREEN
  run: |
    cd infra/aws/storybook/terraform
    terraform apply -var="active_environment=green" -auto-approve

- name: Verify ACTIVE
  run: |
    curl -f ${{ steps.infra.outputs.active_url }}/index.html
```

## Version History

### v1.0.0 (2026-01-15)
- Initial interface specification
- Required inputs defined
- Optional inputs defined
- Required outputs defined
- Examples provided
- Compliance checklist created

## References

- [Main Documentation](../docs/STORYBOOK-HOSTING.md)
- [AWS Adapter](./aws/storybook/terraform/README.md)
- [Azure Adapter](./azure/storybook/bicep/README.md)
- [Deployment Guide](./shared/storybook/deploy.md)

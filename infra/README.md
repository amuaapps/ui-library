# Infrastructure Templates

This directory contains cloud-specific infrastructure templates for deploying the UI library's supporting services.

## Overview

This directory contains multi-cloud infrastructure implementations that follow the strategy defined in `docs/agents.md`. Each cloud provider implementation provides the same logical functionality using cloud-native tools and services.

**Available Providers:**
- **AWS** - Terraform templates for Amazon Web Services
- **Azure** - Bicep templates for Microsoft Azure
- **Shared** - Common documentation and deployment scripts

## Directory Structure

```
infra/
├── README.md                          # This file
├── aws/                               # AWS infrastructure
│   └── storybook/                     # Storybook hosting
│       └── terraform/                 # Terraform templates
│           ├── main.tf                # Main infrastructure
│           ├── variables.tf           # Input variables
│           ├── outputs.tf             # Output values
│           ├── versions.tf            # Provider versions
│           └── README.md              # AWS-specific docs
├── azure/                             # Azure infrastructure
│   └── storybook/                     # Storybook hosting
│       └── bicep/                     # Bicep templates
│           ├── main.bicep             # Main infrastructure
│           ├── parameters.json        # Parameter values
│           └── README.md              # Azure-specific docs
└── shared/                            # Shared resources
    └── storybook/                     # Storybook deployment
        ├── deploy.md                  # Deployment guide
        └── switch.md                  # Blue/Green switch guide
```

## Multi-Cloud Infrastructure

This infrastructure follows a **multi-cloud strategy** with consistent interfaces:

**Problem:** Different cloud providers have different services, APIs, and tools.

**Solution:** Create cloud-specific implementations that expose a consistent interface.

**Benefits:**
- Choose the cloud provider that fits your needs
- Switch providers without changing application code
- Compare costs and features across providers
- Avoid vendor lock-in

**Example:**
- AWS uses S3 + CloudFront for static hosting
- Azure uses Storage Account + CDN for static hosting
- Both expose the same outputs: `storybook_url_active`, `storybook_url_blue`, `storybook_url_green`

## Quick Start

### AWS Deployment

1. **Prerequisites:**
   - AWS CLI configured with credentials
   - Terraform 1.5+ installed
   - Access to AWS account

2. **Navigate to AWS templates:**
   ```bash
   cd infra/aws/storybook/terraform
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Configure variables:**
   ```bash
   # Create terraform.tfvars
   cat > terraform.tfvars << EOF
   project_name = "ui-library"
   environment  = "dev"
   region       = "us-east-1"
   EOF
   ```

5. **Deploy:**
   ```bash
   terraform plan
   terraform apply
   ```

6. **Get outputs:**
   ```bash
   terraform output
   ```

See `infra/aws/storybook/terraform/README.md` for detailed instructions.

### Azure Deployment

1. **Prerequisites:**
   - Azure CLI installed and logged in
   - Bicep CLI installed
   - Access to Azure subscription

2. **Navigate to Azure templates:**
   ```bash
   cd infra/azure/storybook/bicep
   ```

3. **Configure parameters:**
   ```bash
   # Edit parameters.json
   {
     "projectName": { "value": "ui-library" },
     "environment": { "value": "dev" },
     "location": { "value": "eastus" }
   }
   ```

4. **Deploy:**
   ```bash
   az deployment group create \
     --resource-group rg-ui-library-dev \
     --template-file main.bicep \
     --parameters parameters.json
   ```

5. **Get outputs:**
   ```bash
   az deployment group show \
     --resource-group rg-ui-library-dev \
     --name main \
     --query properties.outputs
   ```

See `infra/azure/storybook/bicep/README.md` for detailed instructions.

## Deployment Workflow

### Initial Setup (One-time)

1. **Choose cloud provider** (AWS or Azure)
2. **Configure credentials** for your chosen provider
3. **Deploy infrastructure** using templates
4. **Note output values** (URLs, resource names)
5. **Configure CI/CD** with output values

### Regular Deployments (Automated via CI)

1. **Build Storybook:** `npm run build-storybook`
2. **Upload to GREEN:** Use cloud-specific upload command
3. **Verify GREEN:** Check URL is accessible
4. **Switch to GREEN:** Update active endpoint
5. **Verify ACTIVE:** Confirm switch successful

See `infra/shared/storybook/deploy.md` for detailed workflow.

## Tearing Down Infrastructure

### AWS

```bash
cd infra/aws/storybook/terraform
terraform destroy
```

**Warning:** This will delete all resources including stored Storybook files.

### Azure

```bash
az group delete --name rg-ui-library-dev --yes
```

**Warning:** This deletes the entire resource group and all contained resources.

## Configuration

### Required Variables

All adapters require these minimum variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `project_name` | Project identifier for resource naming | `ui-library` |
| `environment` | Environment name | `dev`, `staging`, `prod` |
| `region` / `location` | Cloud region | `us-east-1`, `eastus` |

### Optional Variables

| Variable | Description | Default | When to Use |
|----------|-------------|---------|-------------|
| `enable_blue_green` | Enable blue/green deployment | `true` | Always recommended |
| `enable_cdn` | Enable CDN distribution | `true` for prod | Production traffic |
| `custom_domain_name` | Custom domain for Storybook | None | Branded URLs |
| `dns_zone_id` | DNS zone identifier | None | With custom domain |
| `retention_policy_days` | Log retention period | `30` | Compliance needs |
| `tags` | Resource tags | `{}` | Cost tracking |

### Environment-Specific Configurations

**Development:**
```hcl
project_name = "ui-library"
environment  = "dev"
region       = "us-east-1"
enable_cdn   = false  # Optional, save costs
```

**Staging:**
```hcl
project_name = "ui-library"
environment  = "staging"
region       = "us-east-1"
enable_blue_green = true
enable_cdn        = true
```

**Production:**
```hcl
project_name        = "ui-library"
environment         = "prod"
region              = "us-east-1"
enable_blue_green   = true
enable_cdn          = true
custom_domain_name  = "storybook.example.com"
dns_zone_id         = "Z1234567890ABC"
```

## Outputs

All adapters provide consistent outputs:

| Output | Description | Example |
|--------|-------------|---------|
| `storybook_url_active` | Current active URL | `https://d111111abcdef8.cloudfront.net` |
| `storybook_url_blue` | Blue environment URL | `https://storybook-blue.s3-website-us-east-1.amazonaws.com` |
| `storybook_url_green` | Green environment URL | `https://storybook-green.s3-website-us-east-1.amazonaws.com` |
| `upload_target_blue` | Blue upload destination | `s3://storybook-blue` |
| `upload_target_green` | Green upload destination | `s3://storybook-green` |
| `cdn_distribution_id` | CDN identifier (if enabled) | `E1234567890ABC` |

**Usage in CI:**
```yaml
- name: Upload to GREEN
  run: |
    aws s3 sync storybook-static/ ${{ steps.terraform.outputs.upload_target_green }}
```

## Blue/Green Deployment

### Concept

Blue/Green deployment maintains two identical environments:
- **BLUE** - Currently active, serving production traffic
- **GREEN** - Candidate version, being validated

### Workflow

1. **Deploy to GREEN:**
   - Upload new Storybook to GREEN environment
   - GREEN has its own URL for testing

2. **Validate GREEN:**
   - Access GREEN URL
   - Verify Storybook loads correctly
   - Test functionality

3. **Switch to GREEN:**
   - Update active endpoint to point to GREEN
   - Traffic now flows to GREEN
   - BLUE remains unchanged (rollback target)

4. **Rollback (if needed):**
   - Revert active endpoint to BLUE
   - Traffic returns to previous version
   - Fix issues in GREEN

### Switch Mechanism

**AWS:**
- Update CloudFront distribution origin to GREEN bucket
- Propagation: 1-5 minutes

**Azure:**
- Update CDN origin to GREEN storage account
- Propagation: 1-5 minutes

See `infra/shared/storybook/switch.md` for detailed commands.

## Security Best Practices

### Credentials

**Never commit:**
- Cloud provider credentials
- Access keys or tokens
- Terraform state files with sensitive data

**Use:**
- Environment variables for credentials
- Cloud provider credential managers
- CI/CD secrets management

### Access Control

**Principle of least privilege:**
- Infrastructure deployment: Admin/Owner role
- CI/CD upload: Write-only to storage
- Public access: Read-only to CDN/public endpoint

### Encryption

**All adapters enforce:**
- HTTPS only for public access
- Encryption at rest for storage
- Encryption in transit for all data

## Cost Management

### Estimated Costs

**Development (minimal traffic):**
- AWS: ~$1-2/month
- Azure: ~$1-2/month

**Production (moderate traffic):**
- AWS: ~$5-20/month
- Azure: ~$5-20/month

### Cost Optimization

1. **Disable CDN in dev** - Save ~$5/month
2. **Use lifecycle policies** - Auto-delete old versions
3. **Monitor usage** - Set up billing alerts
4. **Single environment in dev** - Disable blue/green

### Cost Breakdown

**AWS:**
- S3 storage: ~$0.01/month (negligible)
- CloudFront: ~$5-15/month (depends on traffic)
- Route53: ~$0.50/month (if using custom domain)

**Azure:**
- Storage: ~$0.01/month (negligible)
- CDN: ~$5-15/month (depends on traffic)
- DNS: ~$0.50/month (if using custom domain)

## Troubleshooting

### Common Issues

**Issue: Terraform/Bicep validation fails**
- Check syntax with `terraform validate` or `az bicep build`
- Verify all required variables are provided
- Check provider versions are compatible

**Issue: Deployment fails with permissions error**
- Verify cloud credentials are configured
- Check IAM/RBAC permissions
- Ensure service principal has required roles

**Issue: Storybook URL returns 404**
- Verify files were uploaded to correct location
- Check bucket/container permissions
- Verify CDN origin configuration

**Issue: Switch doesn't take effect**
- Wait for CDN propagation (1-5 minutes)
- Create CDN invalidation if needed
- Verify switch command completed successfully

### Getting Help

1. **Check adapter-specific README** - AWS or Azure specific docs
2. **Review deployment guide** - `infra/shared/storybook/deploy.md`
3. **Check main documentation** - `docs/STORYBOOK-HOSTING.md`
4. **Open an issue** - GitHub Issues with reproduction steps

## Contributing

### Adding a New Adapter

1. **Create directory structure:**
   ```
   infra/{cloud-provider}/storybook/{iac-tool}/
   ```

2. **Implement required resources:**
   - Static file storage
   - CDN/public access (optional)
   - Blue/Green environments

3. **Expose standard outputs:**
   - `storybook_url_active`
   - `storybook_url_blue`
   - `storybook_url_green`
   - Upload targets

4. **Document:**
   - Create README.md in adapter directory
   - Update this file with new adapter
   - Add deployment examples

### Modifying Existing Adapters

1. **Follow IaC best practices:**
   - Terraform: Use modules, variables, outputs
   - Bicep: Use parameters, modules, outputs

2. **Maintain consistency:**
   - Keep variable names aligned across adapters
   - Preserve output structure
   - Document breaking changes

3. **Test thoroughly:**
   - Validate syntax
   - Deploy to test environment
   - Verify outputs
   - Test blue/green switch

## References

- [Main Documentation](../docs/STORYBOOK-HOSTING.md)
- [Agents.md - Infrastructure Standards](../docs/agents.md)
- [AWS Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Azure Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Storybook Documentation](https://storybook.js.org/docs)

## License

MIT License - see [LICENSE](../LICENSE) for details.

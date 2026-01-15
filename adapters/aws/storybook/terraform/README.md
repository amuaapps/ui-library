# AWS Storybook Hosting - Terraform

This directory contains Terraform templates for hosting Storybook on AWS using S3 and CloudFront.

## Architecture

**Components:**
- **S3 Buckets** - Two buckets for blue/green deployment
- **CloudFront Distribution** - CDN for global distribution and HTTPS
- **Route53 (Optional)** - DNS for custom domain
- **IAM Policies** - Least privilege access control

**Blue/Green Strategy:**
- Two S3 buckets: `storybook-blue` and `storybook-green`
- CloudFront distribution with switchable origin
- Switch by updating CloudFront origin configuration
- Rollback by reverting to previous origin

## Prerequisites

- AWS CLI configured with credentials
- Terraform 1.5 or later
- AWS account with appropriate permissions

## Quick Start

### 1. Initialize Terraform

```bash
cd adapters/aws/storybook/terraform
terraform init
```

### 2. Configure Variables

Create `terraform.tfvars`:

```hcl
project_name = "ui-library"
environment  = "dev"
region       = "us-east-1"
```

### 3. Deploy Infrastructure

```bash
# Review planned changes
terraform plan

# Apply changes
terraform apply
```

### 4. Get Outputs

```bash
terraform output
```

## Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `project_name` | Project identifier | `ui-library` |
| `environment` | Environment name | `dev`, `staging`, `prod` |
| `region` | AWS region | `us-east-1` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `enable_blue_green` | Enable blue/green deployment | `true` |
| `enable_cdn` | Enable CloudFront CDN | `true` |
| `custom_domain_name` | Custom domain for Storybook | `null` |
| `route53_zone_id` | Route53 hosted zone ID | `null` |
| `retention_policy_days` | S3 log retention | `30` |
| `tags` | Resource tags | `{}` |

### Example Configurations

**Development:**
```hcl
project_name = "ui-library"
environment  = "dev"
region       = "us-east-1"
enable_cdn   = false  # Save costs
```

**Production:**
```hcl
project_name        = "ui-library"
environment         = "prod"
region              = "us-east-1"
enable_blue_green   = true
enable_cdn          = true
custom_domain_name  = "storybook.example.com"
route53_zone_id     = "Z1234567890ABC"

tags = {
  Project     = "UI Library"
  Environment = "Production"
  ManagedBy   = "Terraform"
}
```

## Outputs

| Output | Description |
|--------|-------------|
| `storybook_url_active` | Current active URL |
| `storybook_url_blue` | Blue environment URL |
| `storybook_url_green` | Green environment URL |
| `upload_target_blue` | Blue S3 bucket name |
| `upload_target_green` | Green S3 bucket name |
| `cdn_distribution_id` | CloudFront distribution ID |

## Deployment

### Upload to GREEN

```bash
# Get GREEN bucket
GREEN_BUCKET=$(terraform output -raw upload_target_green)

# Upload Storybook
aws s3 sync ../../../../storybook-static/ s3://${GREEN_BUCKET}/ --delete
```

### Validate GREEN

```bash
GREEN_URL=$(terraform output -raw storybook_url_green)
curl -I ${GREEN_URL}/index.html
```

### Switch to GREEN

```bash
terraform apply -var="active_environment=green"
```

### Rollback to BLUE

```bash
terraform apply -var="active_environment=blue"
```

## Maintenance

### Update Infrastructure

```bash
# Pull latest templates
git pull

# Review changes
terraform plan

# Apply updates
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

**Warning:** This deletes all resources including stored Storybook files.

## Troubleshooting

### Terraform Init Fails

**Issue:** Provider download fails

**Solution:**
```bash
# Clear cache
rm -rf .terraform
terraform init -upgrade
```

### Apply Fails with Permission Error

**Issue:** Insufficient AWS permissions

**Solution:**
```bash
# Verify credentials
aws sts get-caller-identity

# Check required permissions:
# - s3:CreateBucket, s3:PutObject, s3:GetObject
# - cloudfront:CreateDistribution, cloudfront:UpdateDistribution
# - route53:ChangeResourceRecordSets (if using custom domain)
```

### CloudFront Takes Long to Propagate

**Issue:** Changes take 10-15 minutes

**Solution:**
```bash
# Create invalidation for faster update
DIST_ID=$(terraform output -raw cdn_distribution_id)
aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths "/*"
```

## Cost Estimates

**Development:**
- S3 storage: ~$0.01/month
- Data transfer: ~$0.50/month
- **Total: ~$1/month**

**Production (with CDN):**
- S3 storage: ~$0.01/month
- CloudFront: ~$5-15/month
- Route53: ~$0.50/month
- **Total: ~$5-20/month**

## Security

### IAM Permissions

**Deployment (Terraform):**
- S3: Full access to created buckets
- CloudFront: Create/update distributions
- Route53: Update records (if custom domain)

**CI/CD Upload:**
- S3: PutObject only to specific buckets
- No CloudFront permissions needed
- No Route53 permissions needed

### Bucket Security

- Private buckets (no public access)
- Access only via CloudFront
- Server-side encryption enabled
- Versioning enabled for rollback

## References

- [Main Documentation](../../../../docs/STORYBOOK-HOSTING.md)
- [Deployment Guide](../../../shared/storybook/deploy.md)
- [Switch Guide](../../../shared/storybook/switch.md)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

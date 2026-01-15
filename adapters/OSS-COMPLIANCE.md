# OSS Compliance and Assumptions

This document verifies that all infrastructure templates and scripts are OSS-friendly with minimal assumptions.

## Version

**Document Version:** v1.0.0  
**Last Reviewed:** January 15, 2026  
**Status:** ✅ Compliant

## OSS-Friendly Principles

### 1. No Hardcoded Credentials ✅

**Requirement:** No credentials, API keys, or secrets in code or configuration.

**Verification:**
- ✅ AWS templates use AWS CLI credentials
- ✅ Azure templates use Azure CLI credentials
- ✅ No hardcoded access keys
- ✅ No hardcoded passwords
- ✅ No hardcoded tokens
- ✅ `.gitignore` excludes sensitive files

**Files Checked:**
- `adapters/aws/storybook/terraform/*.tf`
- `adapters/azure/storybook/bicep/*.bicep`
- `adapters/shared/storybook/*.sh`

### 2. No Organization-Specific Values ✅

**Requirement:** No hardcoded organization names, domains, or identifiers.

**Verification:**
- ✅ All organization values are parameterized
- ✅ Examples use `example.com` placeholder
- ✅ Project names are variables
- ✅ Resource groups are parameterized
- ✅ No hardcoded account IDs

**Parameterized Values:**
- `project_name` / `projectName` - User-provided
- `environment` - User-provided (dev/staging/prod)
- `custom_domain_name` - Optional, user-provided
- `route53_zone_id` / `dnsZoneResourceId` - Optional, user-provided

### 3. Minimal External Dependencies ✅

**Requirement:** Only require commonly available tools.

**Required Tools:**
- AWS: `terraform`, `aws` CLI
- Azure: `az` CLI (includes Bicep)
- Shared: `bash`, `curl`

**Optional Tools:**
- `tflint` - Linting (recommended but not required)
- `checkov` - Security scanning (recommended but not required)

**Verification:**
- ✅ All required tools are industry-standard
- ✅ Scripts check for tool availability
- ✅ Graceful handling of missing optional tools
- ✅ Clear installation instructions provided

### 4. No Proprietary Services ✅

**Requirement:** Only use publicly available cloud services.

**AWS Services Used:**
- S3 - Public service
- CloudFront - Public service
- Route53 - Public service (optional)
- ACM - Public service (optional)

**Azure Services Used:**
- Storage Accounts - Public service
- Azure CDN - Public service
- Azure DNS - Public service (optional)

**Verification:**
- ✅ No private/enterprise-only services
- ✅ All services available to any AWS/Azure account
- ✅ No special access required

### 5. Clear Documentation ✅

**Requirement:** Complete documentation for setup and usage.

**Documentation Provided:**
- ✅ Main README with overview
- ✅ Interface specification (INTERFACE.md)
- ✅ Linting guide (LINTING.md)
- ✅ Upload guide (UPLOAD.md)
- ✅ Verification guide (VERIFICATION.md)
- ✅ Deployment guide (deploy.md)
- ✅ Switch guide (switch.md)
- ✅ Cloud-specific READMEs

**Verification:**
- ✅ All parameters documented
- ✅ All outputs documented
- ✅ Examples provided
- ✅ Troubleshooting guides included

### 6. Permissive Licensing ✅

**Requirement:** Compatible with open source distribution.

**License:** MIT License (from repository root)

**Verification:**
- ✅ No proprietary code
- ✅ No restrictive licenses
- ✅ All scripts are original work
- ✅ No third-party code without attribution

### 7. No Vendor Lock-in ✅

**Requirement:** Support multiple cloud providers.

**Verification:**
- ✅ AWS implementation (Terraform)
- ✅ Azure implementation (Bicep)
- ✅ Consistent interface across clouds
- ✅ Shared scripts work with both
- ✅ Easy to add more providers

### 8. Configurable Defaults ✅

**Requirement:** Sensible defaults that can be overridden.

**Default Behaviors:**
- ✅ Blue/green enabled by default (can disable)
- ✅ CDN enabled by default (can disable)
- ✅ No custom domain by default (can add)
- ✅ 30-day retention by default (can change)
- ✅ Standard tags applied (can extend)

**Verification:**
- ✅ All defaults are reasonable
- ✅ All defaults can be overridden
- ✅ No forced configurations

## Assumptions Made

### Acceptable Assumptions

**1. Cloud Provider Account Exists**
- User has AWS or Azure account
- User can create resources
- **Justification:** Required for any cloud deployment

**2. CLI Tools Installed**
- User can install `terraform` or `az` CLI
- User can install `bash` and `curl`
- **Justification:** Standard development tools

**3. DNS Management (Optional)**
- User has DNS zone if using custom domain
- User can create DNS records
- **Justification:** Optional feature, clearly documented

**4. Basic Cloud Knowledge**
- User understands cloud concepts
- User can navigate cloud console
- **Justification:** Target audience is developers

**5. Git Repository**
- Code is in a Git repository
- User can commit and push
- **Justification:** Standard for OSS projects

### No Assumptions Made

**❌ Specific Cloud Region**
- Region is parameterized
- No default region enforced

**❌ Specific Resource Names**
- All names are generated from parameters
- No hardcoded resource names

**❌ Specific Network Configuration**
- No VPC/VNet assumptions
- Public internet access assumed (standard)

**❌ Specific IAM/RBAC Setup**
- Uses default credentials
- No custom roles required

**❌ Specific Cost Budget**
- Cost-optimized defaults
- Optional features clearly marked

**❌ Specific CI/CD Platform**
- Examples provided for GitHub Actions
- Adaptable to any CI/CD platform

## Configuration Requirements

### Minimum Required Configuration

**AWS (Terraform):**
```hcl
project_name = "your-project"
environment  = "dev"
region       = "us-east-1"
```

**Azure (Bicep):**
```json
{
  "projectName": { "value": "your-project" },
  "environment": { "value": "dev" },
  "location": { "value": "eastus" }
}
```

**Verification:**
- ✅ Only 3 parameters required
- ✅ All parameters are self-explanatory
- ✅ Examples provided

### Optional Configuration

All optional parameters have sensible defaults:
- `enable_blue_green` - Default: `true`
- `enable_cdn` - Default: `true`
- `custom_domain_name` - Default: `null`
- `retention_policy_days` - Default: `30`
- `tags` - Default: `{}`

## Security Considerations

### No Security Compromises ✅

**Verification:**
- ✅ Private buckets by default (when using CDN)
- ✅ HTTPS enforcement
- ✅ TLS 1.2+ minimum
- ✅ Encryption at rest
- ✅ Least privilege access
- ✅ No public write access

### Documented Trade-offs ✅

**When CDN is disabled:**
- Buckets/containers must be public for read
- Documented in README and configuration
- User choice, not forced

**Skipped security checks:**
- Documented in `.checkov.yml`
- Justified (e.g., logging not required for static sites)
- Can be re-enabled if needed

## Portability

### Easy to Fork ✅

**Verification:**
- ✅ No external dependencies on Amua infrastructure
- ✅ No references to Amua-specific resources
- ✅ All examples use generic placeholders
- ✅ Easy to rename and customize

### Easy to Extend ✅

**Verification:**
- ✅ Modular structure
- ✅ Clear separation of concerns
- ✅ Well-documented interfaces
- ✅ Examples for customization

### Easy to Adapt ✅

**Verification:**
- ✅ Can add more cloud providers
- ✅ Can modify resource configurations
- ✅ Can add custom features
- ✅ Scripts are readable and maintainable

## Testing Without Credentials

### Validation Without Deployment ✅

**What can be tested:**
- ✅ Terraform syntax: `terraform validate`
- ✅ Terraform formatting: `terraform fmt -check`
- ✅ Bicep syntax: `az bicep build`
- ✅ Bicep linting: `az bicep lint`
- ✅ Script syntax: `bash -n script.sh`
- ✅ Documentation completeness: Manual review

**What requires credentials:**
- Terraform plan
- Bicep what-if
- Actual deployment
- Checkov (optional)

**Verification:**
- ✅ Most validation possible without credentials
- ✅ Clear separation of validation vs deployment
- ✅ CI/CD can run validation on PRs

## Compliance Checklist

### Code Quality ✅

- [x] No hardcoded credentials
- [x] No hardcoded organization values
- [x] All parameters documented
- [x] All outputs documented
- [x] Examples provided
- [x] Error handling implemented
- [x] Input validation present

### Documentation ✅

- [x] README with quick start
- [x] Interface specification
- [x] Deployment guides
- [x] Troubleshooting guides
- [x] Best practices documented
- [x] Security considerations explained
- [x] Cost estimates provided

### Security ✅

- [x] No secrets in code
- [x] Least privilege by default
- [x] HTTPS enforced
- [x] Encryption enabled
- [x] Security scanning configured
- [x] Trade-offs documented

### Portability ✅

- [x] Multi-cloud support
- [x] No vendor lock-in
- [x] Standard tools only
- [x] Easy to fork
- [x] Easy to extend
- [x] Easy to adapt

### Testing ✅

- [x] Syntax validation
- [x] Linting configured
- [x] Security scanning configured
- [x] Verification scripts provided
- [x] CI/CD examples provided

## Known Limitations

### 1. Cloud Provider Required

**Limitation:** Requires AWS or Azure account.

**Justification:** Inherent to cloud infrastructure.

**Mitigation:** Support for multiple providers.

### 2. DNS for Custom Domains

**Limitation:** Custom domains require DNS management.

**Justification:** Standard requirement for custom domains.

**Mitigation:** Optional feature, cloud-provided URLs work without DNS.

### 3. CDN Propagation Time

**Limitation:** CDN changes take 1-5 minutes to propagate.

**Justification:** Inherent to CDN architecture.

**Mitigation:** Documented, verification scripts wait appropriately.

### 4. Cost Considerations

**Limitation:** Cloud resources incur costs.

**Justification:** Inherent to cloud services.

**Mitigation:** Cost estimates provided, dev mode minimizes costs.

## Recommendations for Contributors

### When Adding Features

1. ✅ Keep parameters optional when possible
2. ✅ Provide sensible defaults
3. ✅ Document all new parameters
4. ✅ Update examples
5. ✅ Add tests/validation
6. ✅ Update troubleshooting guide

### When Modifying Templates

1. ✅ Maintain backward compatibility
2. ✅ Update interface specification
3. ✅ Test with minimal configuration
4. ✅ Update documentation
5. ✅ Run linting and security checks

### When Writing Scripts

1. ✅ Check for required tools
2. ✅ Provide helpful error messages
3. ✅ Support dry-run mode
4. ✅ Add help text
5. ✅ Follow existing patterns

## Conclusion

**Status:** ✅ **COMPLIANT**

All infrastructure templates and scripts are OSS-friendly with minimal assumptions. The project:

- ✅ Contains no proprietary code
- ✅ Requires no special access
- ✅ Uses only public cloud services
- ✅ Has comprehensive documentation
- ✅ Supports multiple cloud providers
- ✅ Is easy to fork and customize
- ✅ Follows security best practices
- ✅ Has reasonable defaults
- ✅ Is well-tested and validated

**Ready for open source distribution.**

## References

- [Interface Specification](./INTERFACE.md)
- [Linting Guide](./LINTING.md)
- [Main Documentation](../docs/STORYBOOK-HOSTING.md)
- [AWS README](./aws/storybook/terraform/README.md)
- [Azure README](./azure/storybook/bicep/README.md)

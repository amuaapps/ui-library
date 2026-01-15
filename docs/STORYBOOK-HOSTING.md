# Storybook Hosting Infrastructure

This document explains the infrastructure design for hosting the UI library's Storybook documentation.

## Overview

**Current Status:** Design phase  
**Version:** v1.0.0  
**Last Updated:** January 15, 2026

## Build Configuration

### Storybook Build

- **Build Command:** `npm run build-storybook`
- **Output Directory:** `storybook-static/`
- **Entry Point:** `index.html` (at root of output directory)
- **Build Type:** Static site (HTML, CSS, JS assets)
- **Average Build Size:** ~1.5 MB (compressed)

### Build Verification

The build produces:
- `index.html` - Main entry point
- `iframe.html` - Component preview frame
- `assets/` - JavaScript bundles and CSS
- `sb-*/` - Storybook runtime assets
- Font files and favicons

## Design Decisions

### Why Host Storybook Separately from Package Publishing

**Decision:** Storybook documentation is hosted independently from the npm package.

**Rationale:**
1. **Different Audiences:**
   - Package: Consumed by developers via npm
   - Storybook: Viewed by designers, stakeholders, and contributors via browser

2. **Different Lifecycles:**
   - Package: Versioned releases tied to code changes
   - Storybook: Can be updated for documentation improvements without package releases

3. **Different Infrastructure:**
   - Package: GitHub Packages (npm registry)
   - Storybook: Static site hosting (S3/Azure Storage + CDN)

4. **Cost Efficiency:**
   - Static hosting is cheaper than serving from npm registry
   - CDN caching reduces bandwidth costs

5. **Access Control:**
   - Storybook can be publicly accessible for documentation
   - Package access controlled via GitHub Packages authentication

### What "Lightweight Infrastructure" Means

**Definition:** Minimal, cost-effective infrastructure with no server compute.

**AWS Implementation:**
- S3 bucket for static file storage
- CloudFront CDN for global distribution (optional but recommended)
- Route53 for DNS (optional, if custom domain needed)
- **No EC2, ECS, Lambda, or other compute services**

**Azure Implementation:**
- Storage Account with static website hosting
- Azure CDN for global distribution (optional but recommended)
- Azure DNS for custom domain (optional)
- **No App Service, Container Instances, or Functions**

**Cost Profile:**
- **Dev/Staging:** ~$1-5/month (storage + minimal traffic)
- **Production:** ~$5-20/month (storage + CDN + moderate traffic)
- Scales with actual usage (pay-per-request model)

### Blue/Green Deployment Strategy for Storybook

**Decision:** Use blue/green deployment with validation before switching.

**Why Blue/Green for Static Documentation:**

1. **Safe Validation:**
   - Deploy new Storybook to GREEN
   - Verify it loads correctly
   - Switch traffic only after validation passes

2. **Zero-Downtime Updates:**
   - Users always see a working version
   - No "site under construction" pages

3. **Instant Rollback:**
   - If GREEN has issues, revert to BLUE immediately
   - No need to rebuild or redeploy

4. **Alignment with Package Pipeline:**
   - Matches the library's Blue/Green package deployment
   - Consistent deployment patterns across all artifacts

**Implementation Approach:**

**AWS (Recommended: Two Buckets + CloudFront Origin Switch):**
- `storybook-blue` bucket - Currently active version
- `storybook-green` bucket - Candidate version
- CloudFront distribution points to active bucket
- **Switch:** Update CloudFront origin to point to GREEN bucket
- **Rollback:** Revert CloudFront origin to BLUE bucket
- **Propagation:** CloudFront changes take 1-5 minutes

**Alternative AWS (Two CloudFront Distributions + Route53):**
- Blue and Green each have separate CloudFront distributions
- Route53 alias record points to active distribution
- **Switch:** Update Route53 record
- **Rollback:** Revert Route53 record
- **Propagation:** DNS changes take 30-60 seconds

**Azure (Two Storage Accounts + DNS/CDN Switch):**
- `storybookblue` storage account - Currently active
- `storybookgreen` storage account - Candidate
- Azure CDN or DNS points to active storage account
- **Switch:** Update CDN origin or DNS CNAME
- **Rollback:** Revert to BLUE storage account
- **Propagation:** 1-5 minutes for CDN, 30-60 seconds for DNS

**Why Not Simpler Approaches:**

❌ **Single bucket with versioned prefixes:**
- Harder to manage and switch atomically
- Cleanup of old versions more complex
- Less clear separation of environments

❌ **Direct S3 website hosting (no CDN):**
- Slower global performance
- No HTTPS by default
- Higher bandwidth costs
- Less secure (requires public bucket)

### Required vs Optional Parameters

**Required Parameters (Minimum Deployment):**

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `project_name` | Resource naming prefix | `ui-library` |
| `environment` | Environment identifier | `dev`, `staging`, `prod` |
| `region` / `location` | Cloud region | `us-east-1`, `eastus` |

**Optional Parameters (Enhanced Features):**

| Parameter | Purpose | Default | When Needed |
|-----------|---------|---------|-------------|
| `enable_blue_green` | Enable B/G deployment | `true` for prod | Always recommended |
| `enable_cdn` | Enable CDN distribution | `true` for prod | Production traffic |
| `custom_domain_name` | Custom domain | None (cloud URL) | Branded URLs |
| `dns_zone_id` | DNS zone for domain | None | With custom domain |
| `retention_policy_days` | Log retention | `30` | Compliance needs |
| `tags` | Resource tags | `{}` | Cost tracking |

**Deployment Scenarios:**

**Minimal (Dev/Testing):**
```
project_name = "ui-library"
environment = "dev"
region = "us-east-1"
```
Result: Basic S3/Storage hosting with cloud-provided URL

**Production (Recommended):**
```
project_name = "ui-library"
environment = "prod"
region = "us-east-1"
enable_blue_green = true
enable_cdn = true
custom_domain_name = "storybook.example.com"
dns_zone_id = "Z1234567890ABC"
```
Result: Full B/G deployment with CDN and custom domain

## Deployment Workflow

### For Contributors

1. **Make Storybook Changes:**
   - Update component stories
   - Update documentation
   - Test locally: `npm run storybook`

2. **Build Locally (Optional):**
   ```bash
   npm run build-storybook
   # Verify storybook-static/ directory
   ```

3. **Commit and Push:**
   - Changes trigger CI pipeline
   - CI builds and deploys to GREEN

4. **Automatic Deployment:**
   - CI uploads to GREEN environment
   - CI validates GREEN URL
   - CI switches to GREEN (if validation passes)

### For Infrastructure Maintainers

**Initial Setup:**
1. Choose cloud provider (AWS or Azure)
2. Configure required parameters
3. Deploy infrastructure using Terraform/Bicep
4. Note output URLs (BLUE, GREEN, ACTIVE)

**Updates:**
1. Modify infrastructure templates
2. Run validation (fmt, validate, security scan)
3. Apply changes via IaC tools
4. Verify outputs still correct

**Rollback:**
1. Identify issue with current (GREEN) deployment
2. Run switch command to revert to BLUE
3. Investigate and fix GREEN
4. Re-validate and switch back when ready

## Security Considerations

### Access Control

**Storybook Content:**
- Documentation is intended to be publicly accessible
- No authentication required for viewing
- Read-only access for public

**Infrastructure Management:**
- Write access restricted to CI/CD pipelines
- Manual access requires cloud provider credentials
- Least privilege IAM policies

### Data Protection

**No Sensitive Data:**
- Storybook contains only UI documentation
- No API keys, tokens, or credentials
- No user data or PII

**Static Assets Only:**
- No server-side code execution
- No database connections
- No backend APIs

### Best Practices

1. **HTTPS Only:**
   - All traffic encrypted in transit
   - CloudFront/CDN enforces HTTPS

2. **Private Buckets:**
   - S3 buckets not publicly readable
   - Access only via CloudFront/CDN

3. **No Public Write:**
   - Upload only via CI/CD
   - No public write permissions

4. **Audit Logging:**
   - Access logs enabled (optional)
   - CloudTrail/Activity logs for changes

## Cost Optimization

### Storage Costs

**AWS S3:**
- ~$0.023/GB/month for storage
- Typical Storybook: ~2 MB = $0.00005/month
- Negligible for documentation

**Azure Storage:**
- ~$0.018/GB/month for storage
- Similar negligible cost

### Traffic Costs

**Without CDN:**
- AWS S3: $0.09/GB for data transfer out
- Azure Storage: $0.087/GB for data transfer out
- 1000 page views (~2 MB each) = ~$0.18

**With CDN:**
- CloudFront: $0.085/GB (first 10 TB)
- Azure CDN: $0.081/GB (first 10 TB)
- Caching reduces origin requests significantly
- **Recommended for production**

### Estimated Monthly Costs

**Development:**
- Storage: < $0.01
- Traffic: < $1
- **Total: ~$1-2/month**

**Production (with CDN):**
- Storage: < $0.01
- CDN: $5-15 (depends on traffic)
- DNS: $0.50 (if using custom domain)
- **Total: ~$5-20/month**

**Cost Reduction Tips:**
1. Enable CDN caching (reduces origin requests)
2. Use lifecycle policies to delete old versions
3. Disable blue/green in dev (single environment)
4. Use cloud-provided URLs (avoid DNS costs)

## Monitoring and Observability

### Health Checks

**Automated Verification:**
- CI checks GREEN URL before switching
- Verifies `index.html` is reachable
- Verifies key assets load correctly

**Manual Verification:**
- Visit ACTIVE URL after deployment
- Check Storybook loads and renders
- Verify theme switching works

### Metrics to Track

**AWS CloudWatch:**
- S3 bucket size
- CloudFront requests
- CloudFront cache hit ratio
- Error rates (4xx, 5xx)

**Azure Monitor:**
- Storage account size
- CDN requests
- CDN cache efficiency
- HTTP error rates

### Alerting (Optional)

**Recommended Alerts:**
- High error rate (>5% 4xx/5xx)
- Unusual traffic spike
- Storage quota exceeded

**Not Needed:**
- Uptime monitoring (static site, highly available)
- Performance monitoring (CDN handles this)

## Troubleshooting

### Common Issues

**Issue: Storybook not loading**
- Check CloudFront/CDN origin configuration
- Verify S3/Storage bucket permissions
- Check browser console for errors

**Issue: Old version still showing**
- CDN cache not invalidated
- Wait for TTL expiration or create invalidation
- Check if switch actually happened

**Issue: 403 Forbidden**
- S3 bucket policy incorrect
- CloudFront OAC not configured
- Storage account permissions wrong

**Issue: Slow loading**
- CDN not enabled
- Cache headers not set
- Assets not compressed

### Debug Commands

**AWS:**
```bash
# Check bucket contents
aws s3 ls s3://storybook-blue/

# Check CloudFront distribution
aws cloudfront get-distribution --id DISTID

# Test URL
curl -I https://cloudfront-url.cloudfront.net/
```

**Azure:**
```bash
# Check storage account
az storage blob list --account-name storybookblue --container-name '$web'

# Check CDN endpoint
az cdn endpoint show --name storybook --profile-name cdn-profile

# Test URL
curl -I https://storybookblue.z13.web.core.windows.net/
```

## Future Enhancements

### Planned Improvements

1. **Versioned Documentation:**
   - Host multiple Storybook versions simultaneously
   - Allow users to browse historical versions
   - Automatic archival of old versions

2. **Preview Deployments:**
   - Deploy PR previews to temporary URLs
   - Allow review before merging
   - Automatic cleanup after merge

3. **Performance Optimization:**
   - Brotli compression for assets
   - HTTP/2 push for critical resources
   - Service worker for offline access

4. **Analytics:**
   - Track popular components
   - Monitor user engagement
   - Identify documentation gaps

### Not Planned

- ❌ Server-side rendering (static site only)
- ❌ Authentication (public documentation)
- ❌ Database integration (no dynamic content)
- ❌ API endpoints (documentation only)

## References

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Azure Static Website Hosting](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
- [Azure CDN Documentation](https://docs.microsoft.com/en-us/azure/cdn/)
- [Storybook Documentation](https://storybook.js.org/docs)

## Changelog

### v1.0.0 (2026-01-15)
- Initial design decisions documented
- Blue/Green strategy defined
- Cost estimates provided
- Security considerations outlined

# Release Process

This document describes how to release new versions of the UI library using the automated four-stage pipeline.

## Quick Start

**To release a new version:**

1. Merge your PR to `develop` or `main`
2. Pipeline automatically runs all 4 stages
3. If all checks pass, version is promoted to `latest`
4. Users can install with `npm install @amuaapps/ui-library@latest`

That's it! The pipeline handles everything automatically.

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: TEST                                               │
│ • Lint, typecheck, format check                            │
│ • Unit tests (80% coverage required)                       │
│ • Token compliance check                                   │
│ • Storybook build verification                             │
│ • Security audit (npm audit + CodeQL)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: BUILD                                              │
│ • TypeScript compilation                                    │
│ • Vite bundling                                             │
│ • Type declarations generation                              │
│ • Artifact storage (no rebuild later)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 3: DEPLOY GREEN (candidate)                          │
│ • Publish to GitHub Packages                                │
│ • Dist-tag: "next" (not "latest")                          │
│ • Version: {version}-next.{run_number}                     │
│ • Existing users NOT affected                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 4: TEST INFRA & PROMOTE TO BLUE                      │
│ • Install GREEN version in smoke test                      │
│ • Run consumer validation tests                            │
│ • Verify package integrity                                 │
│ • Check for secrets/sensitive data                         │
│ • IF ALL PASS: Promote to "latest" (BLUE)                  │
│ • IF ANY FAIL: Keep "latest" unchanged (safe)              │
└─────────────────────────────────────────────────────────────┘
```

## Version Strategy

### All Branches (main, staging, develop)
- Version format: `{base}-next.{run_number}`
- Example: `1.0.0-next.123`
- Intended for: Pre-release candidates
- **Only published when package.json version changes**

## Blue/Green Deployment

### What is Blue/Green?

- **BLUE** = Stable production version (`latest` dist-tag)
- **GREEN** = Candidate version under validation (`next` dist-tag)

### How It Works

1. **Deploy GREEN**: New version published to `next` dist-tag
2. **Test GREEN**: Automated tests run against the candidate
3. **Promote to BLUE**: If tests pass, `latest` tag updated
4. **Rollback**: If tests fail, `latest` remains unchanged

### Safety Guarantees

✅ **Zero downtime** - Users always have access to stable version  
✅ **Safe rollback** - Failed deployments don't affect production  
✅ **Automated validation** - No manual promotion steps  
✅ **Traceable** - All versions remain in registry  

## Installation

### For Consumers

```bash
# Install stable version (BLUE)
npm install @amuaapps/ui-library@latest

# Install candidate version (GREEN) for testing
npm install @amuaapps/ui-library@next

# Install specific version
npm install @amuaapps/ui-library@1.0.0-next.123
```

### Authentication

To install from GitHub Packages, configure npm:

```bash
# Create or edit ~/.npmrc
echo "@amuaapps:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

Or use project-level `.npmrc`:
```
@amuaapps:registry=https://npm.pkg.github.com
```

## Monitoring Releases

### Check Pipeline Status

1. Go to repository on GitHub
2. Click "Actions" tab
3. View "Release Pipeline" workflow runs

### View Published Versions

```bash
# List all versions
npm view @amuaapps/ui-library versions

# Check dist-tags
npm view @amuaapps/ui-library dist-tags

# View package info
npm info @amuaapps/ui-library
```

### GitHub Packages UI

Visit: `https://github.com/amuaapps/ui-library/packages`

## Troubleshooting

### Stage 1 Fails (Test)

**Symptoms:** Lint, test, or security check fails

**Resolution:**
1. Check workflow logs for specific error
2. Run locally: `npm run lint && npm run typecheck && npm test`
3. Fix issues and push again

### Stage 2 Fails (Build)

**Symptoms:** Build artifacts missing or invalid

**Resolution:**
1. Check build logs
2. Run locally: `npm run build`
3. Verify `dist/` directory contents

### Stage 3 Fails (Deploy GREEN)

**Symptoms:** Publish to GitHub Packages fails

**Resolution:**
1. Check `GITHUB_TOKEN` permissions
2. Verify package name and scope
3. Check GitHub Packages status

### Stage 4 Fails (Test & Promote)

**Symptoms:** Smoke test or integrity check fails

**Resolution:**
1. GREEN version remains on `next` dist-tag
2. BLUE (`latest`) is NOT updated - users safe
3. Install GREEN version locally to debug:
   ```bash
   npm install @amuaapps/ui-library@next
   ```
4. Fix issues and push again

**Important:** Failed Stage 4 does NOT require rollback - `latest` was never changed.

## Manual Operations

### Check Current Dist-Tags

```bash
npm dist-tag ls @amuaapps/ui-library
```

### Manually Promote Version (Emergency Only)

```bash
# Authenticate first
npm login --registry=https://npm.pkg.github.com

# Promote specific version to latest
npm dist-tag add @amuaapps/ui-library@1.0.0-next.123 latest
```

**⚠️ Warning:** Manual promotion bypasses validation. Only use in emergencies.

### Rollback to Previous Version

```bash
# Find previous version
npm view @amuaapps/ui-library versions

# Point latest to previous version
npm dist-tag add @amuaapps/ui-library@1.0.0-next.122 latest
```

## Best Practices

### Before Merging

1. ✅ All tests pass locally
2. ✅ PR approved by reviewer
3. ✅ No merge conflicts
4. ✅ Documentation updated

### After Merging

1. ✅ Monitor pipeline in GitHub Actions
2. ✅ Verify Stage 4 completes successfully
3. ✅ Test installed package in consumer app
4. ✅ Update release notes (if applicable)

### Version Bumping

To bump the base version (e.g., `1.0.0` → `1.1.0`):

1. Update `version` in `package.json`
2. Commit: `git commit -m "chore: bump version to 1.1.0"`
3. Push to `main`, `staging`, or `develop`
4. Pipeline will append `-next.N` automatically

### Testing GREEN Before Promotion

```bash
# Install GREEN version in test project
npm install @amuaapps/ui-library@next

# Run your tests
npm test

# If issues found, fix and push again
# Pipeline will create new GREEN version
```

## Security

### Secrets Management

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- No additional secrets required
- Never commit tokens to repository

### Package Integrity

Stage 4 validates:
- ✅ Required files present (`dist/`, `package.json`, etc.)
- ✅ No secrets or sensitive data in package
- ✅ Package structure matches expectations
- ✅ Consumer smoke test passes

### Audit Checks

- `npm audit` runs in Stage 1 (high/critical severity blocks)
- CodeQL security scanning runs in Stage 1
- Both are CI-blocking

## Compliance

This release process ensures:

✅ **agents.md compliance** - Four-stage gated pipeline  
✅ **TypeScript strict mode** - Enforced in Stage 1  
✅ **80% test coverage** - Enforced in Stage 1  
✅ **Token compliance** - No hardcoded values allowed  
✅ **Security scanning** - CodeQL + npm audit  
✅ **Automated testing** - No manual steps  
✅ **Safe rollback** - Failed deploys don't affect production  

## Support

For issues with the release pipeline:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. See [`docs/CI-CD.md`](./CI-CD.md) for technical details
4. Open an issue in the repository

## Changelog

- **v1.0** - Initial four-stage pipeline with Blue/Green deployment

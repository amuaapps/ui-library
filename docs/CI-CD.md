# CI/CD Pipeline Documentation

This document describes the GitHub Actions CI/CD pipeline for the UI library, implementing a four-stage gated release process with Blue/Green deployment strategy.

## Overview

The pipeline follows the **four-stage gated deployment** pattern as defined in `agents.md`:

1. **Test** - Validate code quality, security, and functionality
2. **Build** - Produce publishable artifacts
3. **Deploy GREEN** - Publish candidate version to `next` dist-tag
4. **Test Infra + Switch Blue/Green** - Validate and promote to `latest`

## Blue/Green Deployment Strategy

For npm packages, Blue/Green deployment is implemented using dist-tags:

- **BLUE (Stable)** = `latest` dist-tag - Current production version consumed by users
- **GREEN (Candidate)** = `next` dist-tag - New version undergoing validation

### Safety Guarantees

✅ **No breaking changes to stable users** - `latest` tag only updates after all validation passes  
✅ **Rollback-safe** - If Stage 4 fails, `latest` remains unchanged  
✅ **Traceable** - All versions remain in registry history  
✅ **Testable** - GREEN version can be tested before promotion  

## Pipeline Stages

### Stage 1: Test

**Purpose:** Validate code quality, security, and functionality before building artifacts.

**Checks Performed:**
1. Linting (ESLint)
2. Type checking (TypeScript strict mode)
3. Formatting (Prettier)
4. Unit tests with 80% coverage
5. Token compliance (no hardcoded values)
6. Storybook build verification
7. Security audit (npm audit)
8. CodeQL analysis

### Stage 2: Build

**Purpose:** Produce publishable artifacts without rebuilding in later stages.

**Steps:**
1. Build library (TypeScript + Vite)
2. Verify build artifacts
3. Pack for publishing
4. Upload artifacts for later stages

### Stage 3: Deploy GREEN

**Purpose:** Publish candidate version to GREEN channel without affecting stable users.

**Steps:**
1. Download build artifacts from Stage 2
2. Configure for GitHub Packages
3. Determine version (main: `-next.N`, develop: `-dev.N`)
4. Publish to `next` dist-tag
5. Create deployment marker

### Stage 4: Test Infra + Switch Blue/Green

**Purpose:** Validate GREEN version and promote to BLUE only if all checks pass.

**Steps:**
1. Load deployment info
2. Run consumer smoke test with GREEN version
3. Verify package integrity
4. Check token compliance
5. Promote GREEN to BLUE (update `latest` dist-tag)
6. Create release summary

**Rollback:** If any check fails, `latest` remains unchanged.

## Usage

### Installing Versions

```bash
# Install stable (BLUE)
npm install @amuaapps/ui-library@latest

# Install candidate (GREEN)
npm install @amuaapps/ui-library@next

# Install specific version
npm install @amuaapps/ui-library@0.1.0-next.42
```

### Triggering Releases

**Automatic:**
- Push to `main` → Full pipeline (all 4 stages)
- Push to `develop` → Full pipeline (all 4 stages)
- Pull request → Validation only (Stages 1-2)

**Manual:** Not supported - all releases are automated.

## Required Secrets

Configure in GitHub repository settings:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- No additional secrets required (uses GitHub Packages)

## Monitoring

**Check pipeline status:**
- GitHub Actions tab in repository
- Commit status checks on PRs

**View published versions:**
- GitHub Packages: `https://github.com/amuaapps/ui-library/packages`
- npm info: `npm view @amuaapps/ui-library dist-tags`

## Troubleshooting

**Stage 1 fails:**
- Check lint/test/format errors in logs
- Run locally: `npm run lint && npm run typecheck && npm test`

**Stage 2 fails:**
- Build artifacts missing
- Run locally: `npm run build`

**Stage 3 fails:**
- Authentication issue with GitHub Packages
- Check `GITHUB_TOKEN` permissions

**Stage 4 fails:**
- Smoke test failure - check smoke-test logs
- Package integrity issue - review package contents
- `latest` tag NOT updated (safe)

## Best Practices

1. **Always use PRs** - Validate changes before merging
2. **Monitor Stage 4** - Ensure promotion succeeds
3. **Test GREEN first** - Install `@next` before promoting
4. **Keep `latest` stable** - Only merge tested code
5. **Review security alerts** - Address CodeQL findings

## Compliance

This pipeline enforces:
- ✅ TypeScript strict mode
- ✅ 80% test coverage
- ✅ Token compliance (no hardcoded values)
- ✅ Security scanning (CodeQL + npm audit)
- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint)

All checks are CI-blocking and must pass before deployment.

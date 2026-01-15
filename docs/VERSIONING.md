# Versioning and Release Discipline

This document describes the semantic versioning strategy and release workflow for the UI library.

## Overview

The library uses **semantic versioning (semver)** with **changesets** for deterministic, traceable version management:

- **Semantic Versioning**: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- **Changesets**: Track changes and automate version bumps
- **Git Tags**: Every release creates a git tag (`v1.2.3`)
- **GitHub Releases**: Automated release notes from changesets
- **Changelog**: Auto-generated from changeset descriptions

## Semantic Versioning Rules

### MAJOR (Breaking Changes)
Increment when making incompatible API changes:
- Removing or renaming components
- Changing component props (removing, renaming)
- Changing default behavior that breaks existing usage
- Removing or changing exported utilities

**Example:** `1.2.3` → `2.0.0`

### MINOR (New Features)
Increment when adding functionality in a backward-compatible manner:
- Adding new components
- Adding new props to existing components
- Adding new utilities or hooks
- Enhancing existing features without breaking changes

**Example:** `1.2.3` → `1.3.0`

### PATCH (Bug Fixes)
Increment when making backward-compatible bug fixes:
- Fixing bugs
- Updating dependencies (non-breaking)
- Performance improvements
- Documentation updates
- Internal refactoring

**Example:** `1.2.3` → `1.2.4`

## Changeset Workflow

### Adding a Changeset (Required for PRs)

Every PR that changes functionality **must** include a changeset:

```bash
npm run changeset
```

Follow the prompts:
1. Select change type (major/minor/patch)
2. Write user-facing description
3. Commit the generated changeset file

### Example Changeset

```markdown
---
"@amuaapps/ui-library": minor
---

Add new Tooltip component with hover and click triggers
```

### Skipping Changesets

Add `skip-changeset` label to PR for:
- Documentation-only changes
- CI/CD configuration
- Development tooling
- Test-only changes

## Release Process

### Automatic Releases (Recommended)

1. **Create PR with changeset**
2. **Merge to main**
3. **Changesets bot creates "Version Packages" PR**
4. **Merge version PR** → Triggers release pipeline

### Manual Release (Emergency Only)

```bash
# Via GitHub Actions UI
# Go to Actions → Version and Release → Run workflow
# Select release type: patch/minor/major
```

**⚠️ Use manual releases sparingly** - prefer changeset-based releases.

## Version Lifecycle

```
Developer → Changeset → PR → Merge → Version PR → Release
    ↓          ↓         ↓      ↓         ↓          ↓
  Change    Describe   Review  Main   Bump Ver   Publish
```

### Detailed Flow

1. **Developer makes changes**
   - Implements feature/fix
   - Runs `npm run changeset`
   - Commits changeset file

2. **PR Review**
   - Changeset check validates presence
   - Code review happens
   - Tests pass

3. **Merge to main**
   - Changesets action runs
   - Creates/updates "Version Packages" PR
   - Updates CHANGELOG.md
   - Bumps version in package.json

4. **Version PR Review**
   - Review version bump
   - Review changelog entries
   - Merge when ready

5. **Release Pipeline**
   - Stage 1: Test
   - Stage 2: Build
   - Stage 3: Publish & Tag
   - Stage 4: Validate

6. **Published**
   - Package on GitHub Packages
   - Git tag created
   - GitHub Release created
   - Changelog updated

## Git Tags and Releases

### Tag Format

All releases are tagged with `v` prefix:
- `v1.0.0` - Major release
- `v1.1.0` - Minor release
- `v1.1.1` - Patch release

### GitHub Releases

Automatically created with:
- Release notes from changesets
- Link to full changelog
- Installation instructions
- Package download link

## Changelog

### Format

```markdown
# Changelog

## 1.2.0

### Minor Changes

- abc1234: Add new Tooltip component with hover and click triggers

### Patch Changes

- def5678: Fix Button focus ring in dark mode

## 1.1.0

...
```

### Viewing Changelog

```bash
# View full changelog
cat CHANGELOG.md

# View specific version
git show v1.2.0:CHANGELOG.md
```

## Version Queries

### Check Current Version

```bash
# In package.json
cat package.json | grep version

# Published versions
npm view @amuaapps/ui-library versions

# Latest version
npm view @amuaapps/ui-library version
```

### Check Pending Changes

```bash
# See what will be released
npm run changeset:status
```

## Best Practices

### Writing Good Changeset Descriptions

✅ **Good:**
```markdown
Add keyboard navigation support to Dropdown component
```

❌ **Bad:**
```markdown
Update dropdown
```

### Guidelines

1. **Be specific** - Explain what changed
2. **User-facing** - Write for library consumers
3. **Action-oriented** - Start with verb (Add, Fix, Update)
4. **Context** - Mention component/feature name

### Multiple Changes in One PR

If PR has multiple changes, add multiple changesets:

```bash
npm run changeset  # For feature
npm run changeset  # For bug fix
```

### Breaking Changes

Always include migration guide in changeset:

```markdown
---
"@amuaapps/ui-library": major
---

BREAKING: Remove deprecated `variant` prop from Button

Migration: Use `appearance` prop instead
- Before: `<Button variant="primary">`
- After: `<Button appearance="primary">`
```

## Troubleshooting

### Changeset Check Failing

**Problem:** PR blocked by missing changeset

**Solution:**
```bash
npm run changeset
git add .changeset/*.md
git commit -m "chore: add changeset"
git push
```

### Version Not Bumping

**Problem:** Merged PR but no version PR created

**Solution:**
- Check if changeset file was included in merge
- Manually trigger: Actions → Version and Release → Run workflow

### Wrong Version Bump

**Problem:** Version bumped incorrectly

**Solution:**
1. Don't merge version PR yet
2. Edit changeset in version PR
3. Re-run changesets action
4. Review new version bump

### Multiple Version PRs

**Problem:** Multiple "Version Packages" PRs exist

**Solution:**
1. Close old version PRs
2. Merge latest version PR
3. Delete old branches

## Security

### Version Integrity

- All versions are immutable once published
- Git tags are signed (if GPG configured)
- Package checksums verified in Stage 4

### Rollback

If bad version published:
1. Don't delete version (breaks semver)
2. Publish patch/minor with fix
3. Deprecate bad version: `npm deprecate @amuaapps/ui-library@1.2.3 "Use 1.2.4 instead"`

## Compliance

This versioning strategy ensures:

✅ **Deterministic** - Version bumps follow semver rules  
✅ **Traceable** - Every version maps to git tag  
✅ **Automated** - No manual version editing  
✅ **Documented** - Changelog auto-generated  
✅ **Validated** - Tests run before release  
✅ **Reversible** - Can always rollback via new version  

## Resources

- [Semantic Versioning](https://semver.org/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Conventional Commits](https://www.conventionalcommits.org/)

# Versioning Quick Reference

## For Contributors

### Adding a Changeset to Your PR

```bash
# 1. Make your changes
git checkout -b feature/my-feature

# 2. Create a changeset
npm run changeset

# 3. Answer the prompts
? Which packages would you like to include? › @amuaapps/ui-library
? What kind of change is this for @amuaapps/ui-library? › 
  ❯ patch   (Bug fixes, minor updates)
    minor   (New features, backward-compatible)
    major   (Breaking changes)

# 4. Write description (appears in CHANGELOG)
Summary › Add keyboard navigation to Dropdown

# 5. Commit and push
git add .changeset/*.md
git commit -m "feat: add keyboard navigation to Dropdown"
git push

# 6. Create PR - changeset check will pass ✅
```

### When to Use Each Version Type

| Type | Use When | Example |
|------|----------|---------|
| **patch** | Bug fixes, docs, internal changes | Fix Button hover state |
| **minor** | New features, new components | Add Tooltip component |
| **major** | Breaking changes, API changes | Remove deprecated props |

### Skipping Changesets

For docs-only or CI changes, add `skip-changeset` label to PR.

## For Maintainers

### Releasing a New Version

**Automatic (Recommended):**
1. Merge PRs with changesets to `main`
2. Changesets bot creates "Version Packages" PR
3. Review version bump and changelog
4. Merge version PR → Release pipeline runs

**Manual (Emergency):**
```bash
# Via GitHub Actions UI
Actions → Version and Release → Run workflow
Select: patch/minor/major
```

### Version PR Review Checklist

- [ ] Version bump is correct (semver)
- [ ] CHANGELOG.md entries are clear
- [ ] All changesets are included
- [ ] No unintended changes

### After Release

Check:
- [ ] Git tag created (`v1.2.3`)
- [ ] GitHub Release published
- [ ] Package on GitHub Packages
- [ ] CHANGELOG.md updated
- [ ] Smoke tests passed

## Common Scenarios

### Multiple Changes in One PR

```bash
# Add separate changeset for each logical change
npm run changeset  # For feature
npm run changeset  # For bug fix
```

### Breaking Change

```markdown
---
"@amuaapps/ui-library": major
---

BREAKING: Remove deprecated `size` prop from Button

Migration:
- Before: `<Button size="large">`
- After: `<Button size="lg">`
```

### Hotfix Release

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...

# 3. Add patch changeset
npm run changeset
# Select: patch
# Describe: Fix critical bug in Dialog component

# 4. Create PR to main
# 5. Merge → Version PR created
# 6. Merge version PR → Release
```

## Troubleshooting

### "No changeset found" error

```bash
# Create a changeset
npm run changeset

# Commit it
git add .changeset/*.md
git commit -m "chore: add changeset"
git push
```

### Version not bumping

Check:
1. Changeset file exists in `.changeset/`
2. Changeset merged to `main`
3. Wait for changesets bot (may take 1-2 minutes)

### Wrong version bump

1. Don't merge version PR yet
2. Edit changeset type in version PR
3. Changesets will recalculate
4. Review new version

## Resources

- Full guide: [`VERSIONING.md`](./VERSIONING.md)
- CI/CD: [`CI-CD.md`](./CI-CD.md)
- Release process: [`RELEASE-PROCESS.md`](./RELEASE-PROCESS.md)

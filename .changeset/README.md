# Changesets

This directory contains changeset files that track version changes and generate changelogs.

## What are changesets?

Changesets are a way to manage versions and changelogs with a focus on monorepos and multi-package repositories. For this library, they provide:

- **Deterministic versioning** - Semantic version bumps based on change type
- **Automatic changelogs** - Generated from changeset descriptions
- **PR validation** - Ensures all changes are documented
- **Traceable releases** - Every version maps to specific changes

## Creating a changeset

When you make changes that affect the library's public API or behavior:

```bash
npm run changeset
```

This will prompt you to:
1. Select the type of change (major, minor, or patch)
2. Write a description for the changelog

The CLI will create a new file in this directory with your changeset.

## Changeset files

Each changeset file follows this format:

```markdown
---
"@amuaapps/ui-library": minor
---

Add new Tooltip component with hover and click triggers
```

- **Frontmatter** - Specifies package and change type
- **Description** - User-facing changelog entry

## When to create changesets

### Always create a changeset for:
- New components or features (minor)
- Bug fixes (patch)
- Breaking changes (major)
- API changes (major/minor depending on compatibility)

### Skip changeset for:
- Documentation updates only
- CI/CD configuration
- Development tooling
- Test-only changes

Add `skip-changeset` label to PR if no changeset needed.

## Release process

1. **PR with changeset** → Merged to main
2. **Changesets bot** → Creates "Version Packages" PR
3. **Version PR merged** → Triggers release pipeline
4. **Package published** → With git tag and GitHub release

## Learn more

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Project Versioning Guide](../docs/VERSIONING.md)

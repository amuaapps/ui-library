# UI Library

Amua Apps UI Library - Component library for building modern web applications.

## Status

🚧 Initial setup in progress

## Documentation

This repository follows strict coding standards and design contracts:

### Standards & Contracts

- **[`docs/agents.md`](docs/agents.md)** — Amua Apps coding standards, CI/CD requirements, and OSS setup rules (v1.0.0)
  - TypeScript standards, testing requirements, security guidelines
  - Multi-cloud infrastructure (Azure + AWS) setup
  - GitHub Actions CI/CD pipeline requirements (4-stage: Test → Build → Deploy → Test Infra + Switch Blue/Green)
  - **Non-negotiable:** All code must comply with these standards

- **[`docs/ui-contract.md`](docs/ui-contract.md)** — UI component behavior and composition rules (v1.0.0)
  - Composition principles (no external layout assumptions, className pass-through)
  - Spacing & layout contract (token-based only)
  - Accessibility requirements (WCAG AA minimum)
  - State and interaction patterns

- **[`docs/brand-contract.md`](docs/brand-contract.md)** — Brand identity representation (v1.0.0)
  - Token-first branding strategy
  - Brand profiles and theme variants
  - Color, typography, radius, elevation, and motion guidelines
  - Change management for brand customization

- **[`docs/design-tokens.md`](docs/design-tokens.md)** — Design token system and compliance rules (v1.0.0)
  - Semantic token architecture
  - Token compliance rules (CI-enforced)
  - Color, typography, spacing, radius, elevation, and motion tokens
  - **No hardcoded values allowed** — all styling must use tokens

- **[`docs/tokens.md`](docs/tokens.md)** — Contributor guide for token usage (v1.0.0)
  - Typography tokens (`text-ui-*`)
  - Control sizing tokens (`h-ui-control-*`, `px-ui-control-px-*`, `py-ui-control-py-*`)
  - Elevation tokens (`shadow-ui-*`)
  - When raw Tailwind values are allowed (layout-only)
  - **Required reading for contributors** — ensures future components stay token-compliant

- **[`docs/PACKAGING.md`](docs/PACKAGING.md)** — Packaging strategy and import patterns (v1.0.0)
  - Tree-shakeable ESM exports (`sideEffects: false`)
  - Subpath imports for selective component loading
  - Module preservation for optimal bundle sizes
  - Import pattern examples and best practices

### Implementation Notes

In v1, components remain **out-of-the-box shadcn/ui** where possible, but must comply with:
- Token-first styling (no hardcoded colors, spacing, or arbitrary values)
- Accessibility standards (WCAG AA)
- Composition rules from `ui-contract.md`

**If conflicts arise between these contracts and implementation, the contracts take precedence.**

## Installation

### Prerequisites

- Node.js 18+ and npm 9+
- React 18+ and React DOM 18+
- GitHub account with access to the repository

### 1. Configure npm for GitHub Packages

Create or edit `.npmrc` in your project root:

```bash
@amuaapps:registry=https://npm.pkg.github.com
```

### 2. Authenticate with GitHub Packages

**Option A: Using Personal Access Token (Recommended for local development)**

1. Generate a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `read:packages`
   - Generate and copy the token

2. Add to your `.npmrc`:
   ```bash
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

**Option B: Using npm login (Alternative)**

```bash
npm login --registry=https://npm.pkg.github.com --scope=@amuaapps
# Username: your-github-username
# Password: your-github-token (not your GitHub password!)
# Email: your-email@example.com
```

**Option C: CI/CD Environment**

Use `GITHUB_TOKEN` secret in GitHub Actions:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@amuaapps'

- name: Install dependencies
  run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Install the Package

```bash
# Install latest stable version
npm install @amuaapps/ui-library

# Or install specific version
npm install @amuaapps/ui-library@1.2.3

# Or install candidate version (for testing)
npm install @amuaapps/ui-library@next
```

### Troubleshooting Installation

**Error: 404 Not Found**
- Verify you have access to the repository
- Check your authentication token is valid
- Ensure `.npmrc` is configured correctly

**Error: 401 Unauthorized**
- Regenerate your GitHub token with `read:packages` scope
- Update token in `.npmrc`

**Error: ENOTFOUND npm.pkg.github.com**
- Check your network connection
- Verify proxy settings if behind corporate firewall

## Quick Start

### 1. Import Styles (Required)

Import the library's CSS in your application entry point:

```typescript
// src/main.tsx or src/index.tsx (Vite/React)
import '@amuaapps/ui-library/styles';
import './index.css'; // Your app styles

// Or in Next.js app router: app/layout.tsx
import '@amuaapps/ui-library/styles';
import './globals.css';

// Or in Next.js pages router: pages/_app.tsx
import '@amuaapps/ui-library/styles';
import '../styles/globals.css';
```

**Important:** The styles import must come **before** your app styles to allow proper CSS cascade.

### 2. Configure Tailwind CSS (Required if using Tailwind)

Add the library to your `tailwind.config.ts` content paths:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add library components to Tailwind content
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      // Optional: Extend with your custom theme
    },
  },
  plugins: [
    // Optional: Add Tailwind plugins
  ],
};

export default config;
```

**Why this is needed:** The library uses Tailwind utility classes. Adding it to `content` ensures Tailwind includes the necessary styles in your build.

### 3. Use Components

```typescript
import { Button, Card, CardHeader, CardTitle, CardContent } from '@amuaapps/ui-library';

function App() {
  return (
    <div className="p-8 space-y-4">
      {/* Basic button usage */}
      <Button variant="default">Click me</Button>
      <Button variant="destructive" size="lg">Delete</Button>
      <Button variant="outline" size="sm">Cancel</Button>
      
      {/* Card composition */}
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your first component from the UI library!</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**That's it!** You now have a working setup. See [Usage](#usage) below for more details.

## Usage

### Import Patterns

The library supports two import patterns, both fully tree-shakeable:

#### Root Import (Recommended)

Import from the package root for convenience:

```typescript
// Components
import { Button, Card, Input, Dialog } from '@amuaapps/ui-library';

// Utilities
import { cn } from '@amuaapps/ui-library';

// Hooks
import { useExample } from '@amuaapps/ui-library';

// All in one import
import { Button, Card, cn, useExample } from '@amuaapps/ui-library';
```

**Benefits:**
- ✅ Convenient single import source
- ✅ Fully tree-shakeable (unused code is eliminated)
- ✅ Identical bundle size to subpath imports

#### Subpath Import (Explicit)

Import directly from component/utility paths:

```typescript
// Components
import { Button } from '@amuaapps/ui-library/components/button';
import { Card } from '@amuaapps/ui-library/components/card';

// Utilities
import { cn } from '@amuaapps/ui-library/lib/utils';

// Hooks
import { useExample } from '@amuaapps/ui-library/hooks/use-example';
```

**Benefits:**
- ✅ Explicit about what you're importing
- ✅ Clearer dependency tracking
- ✅ Same bundle size as root imports

**Choose based on preference** - both patterns produce identical production bundles. See [`docs/PACKAGING.md`](docs/PACKAGING.md) for benchmarks and details.

### Applying Tokens and Styles

The library uses a **token-based design system**. All styling must use semantic tokens:

#### Using Design Tokens in Your App

```typescript
// ✅ CORRECT: Use semantic tokens
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ WRONG: Don't use hardcoded colors
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
  <h1 style={{ color: '#0066cc' }}>Title</h1>
</div>
```

#### Available Semantic Tokens

**Colors:**
- `background` / `foreground` - Base colors
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `destructive` / `destructive-foreground` - Destructive actions
- `muted` / `muted-foreground` - Muted content
- `accent` / `accent-foreground` - Accent elements
- `card` / `card-foreground` - Card backgrounds
- `popover` / `popover-foreground` - Popover backgrounds
- `border` - Border colors
- `input` - Input borders
- `ring` - Focus rings

**Usage:**
```typescript
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <Button className="bg-primary text-primary-foreground">
    Primary Action
  </Button>
</div>
```

#### Customizing Tokens

Override CSS variables in your app's CSS:

```css
/* src/index.css or globals.css */
:root {
  /* Override light mode tokens */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}

.dark {
  /* Override dark mode tokens */
  --primary: 220 90% 66%;
  --primary-foreground: 0 0% 0%;
}
```

**Token format:** HSL values without `hsl()` wrapper (e.g., `220 90% 56%`)

See [`docs/design-tokens.md`](docs/design-tokens.md) for complete token reference.

### Dark Mode

The library supports automatic dark mode via the `dark` class:

#### Basic Dark Mode Toggle

```typescript
import { useState } from 'react';
import { Button } from '@amuaapps/ui-library';

function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <Button onClick={() => setIsDark(!isDark)}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </Button>
      </div>
    </div>
  );
}
```

#### System Preference Detection

```typescript
import { useEffect, useState } from 'react';

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { isDark, setIsDark };
}

function App() {
  const { isDark, setIsDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Your app */}
    </div>
  );
}
```

#### Persistent Theme (localStorage)

```typescript
function usePersistedTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  return { isDark, toggleTheme };
}
```

### Theming and Branding

The library supports **theme customization** while maintaining token compliance:

#### Current Theme Support

- ✅ **Light mode** - Default theme
- ✅ **Dark mode** - Automatic via `.dark` class
- ✅ **Custom colors** - Override CSS variables
- ✅ **Token-based** - All styling uses semantic tokens

#### Future Branding Support

The library is designed for **multi-brand support** following the brand contract:

**Planned features:**
- Brand profiles (multiple brand identities)
- Theme variants per brand
- Runtime brand switching
- Brand-specific token overrides

See [`docs/brand-contract.md`](docs/brand-contract.md) for the complete branding strategy and future roadmap.

**For now:** Customize via CSS variable overrides as shown above.

## Development

### Storybook - Component Development Environment

Storybook is the **primary development environment** for this library. It provides an isolated environment for building, testing, and documenting components.

#### Running Storybook Locally

```bash
# Start Storybook dev server (runs on http://localhost:6006)
npm run storybook

# Build static Storybook for deployment
npm run build-storybook
```

#### What Storybook is Used For

**1. Component Development**
- Build components in isolation
- Test different props and states
- Iterate quickly without full app context

**2. Visual Testing**
- Preview components in light/dark modes
- Test responsive behavior
- Verify accessibility features

**3. Documentation**
- Live component examples
- Interactive prop controls
- Usage guidelines and best practices

**4. Design Review**
- Share component previews with designers
- Validate design implementation
- Get feedback before integration

#### Storybook Features

**Theme Switching:**
- Toggle between light and dark modes
- Preview components in both themes
- Verify token-based styling

**Interactive Controls:**
- Modify component props in real-time
- Test different variants and sizes
- Explore component behavior

**Accessibility Testing:**
- Built-in a11y addon
- WCAG compliance checks
- Keyboard navigation testing

**Responsive Preview:**
- Test different viewport sizes
- Mobile/tablet/desktop views
- Responsive behavior validation

#### Writing Stories

Stories are located in `src/components/*.stories.tsx`:

```typescript
// Example: Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};
```

See [`docs/STORYBOOK.md`](docs/STORYBOOK.md) for complete Storybook documentation and guidelines.

### Consumer Smoke Test

The library includes a consumer smoke test that verifies it works correctly when installed as a package:

```bash
npm run smoke-test
```

This test:
- Builds the library
- Installs it in a minimal Vite app
- Imports components via subpath exports
- Verifies the build succeeds
- Confirms token CSS is applied

The smoke test can run in CI without network calls beyond dependency installation. See [`smoke-test/README.md`](./smoke-test/README.md) for details.

### Testing

The library includes comprehensive unit and integration tests with Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ **90 tests** covering utilities and representative components
- ✅ **100% coverage** on tested code (Button, Card, Input, Dialog, utilities)
- ✅ **Accessibility validation** for all interactive components
- ✅ **Token compliance checks** to prevent hardcoded values
- ✅ **80% coverage thresholds** enforced in CI

See [`docs/TESTING.md`](docs/TESTING.md) for complete testing documentation, including:
- Test structure and organization
- Writing new tests
- Accessibility testing patterns
- Token compliance validation
- CI integration

### CI/CD Pipeline

The library uses a **four-stage gated release pipeline** with Blue/Green deployment:

**Pipeline Stages:**
1. **Test** - Lint, typecheck, tests, CodeQL, audit, token compliance, Storybook
2. **Build** - Produce publishable artifacts (no rebuild in later stages)
3. **Deploy GREEN** - Publish to `next` dist-tag (candidate version)
4. **Test Infra + Promote** - Smoke test, validate, promote to `latest` (stable)

**Blue/Green Strategy:**
- **BLUE (latest)** = Stable version for production use
- **GREEN (next)** = Candidate version undergoing validation
- Only promotes to BLUE if all validation passes
- Safe rollback: If Stage 4 fails, `latest` remains unchanged

**Installing Versions:**
```bash
# Stable version (BLUE)
npm install @amuaapps/ui-library@latest

# Candidate version (GREEN)
npm install @amuaapps/ui-library@next
```

See [`docs/CI-CD.md`](docs/CI-CD.md) for complete pipeline documentation.

### Versioning and Releases

The library uses **semantic versioning** with **changesets** for deterministic version management:

**Adding a changeset (required for PRs):**
```bash
npm run changeset
```

Follow the prompts to:
1. Select change type (major/minor/patch)
2. Describe the change for the changelog
3. Commit the generated changeset file

**Version bumps are automatic:**
- Merge PR → Changesets creates "Version Packages" PR
- Merge version PR → Triggers release pipeline
- Package published with git tag and GitHub release

**Every release includes:**
- ✅ Semantic version bump (`v1.2.3`)
- ✅ Git tag created
- ✅ GitHub Release with notes
- ✅ Auto-generated CHANGELOG.md
- ✅ Published to GitHub Packages

See [`docs/VERSIONING.md`](docs/VERSIONING.md) for complete versioning documentation.

### Other Development Commands

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Build the library
npm run build
```

## Contributing

We welcome contributions! Please follow these guidelines to ensure your contributions meet our standards.

### Getting Started

1. **Fork and clone** the repository
2. **Install dependencies:** `npm install`
3. **Create a branch:** `git checkout -b feature/your-feature`
4. **Make your changes** following our standards
5. **Add a changeset:** `npm run changeset`
6. **Commit and push** your changes
7. **Open a Pull Request**

### Contribution Requirements

#### 1. Token Compliance (CI-Blocking)

**All styling MUST use semantic tokens** - no hardcoded values allowed:

```typescript
// ✅ CORRECT: Use semantic tokens
<Button className="bg-primary text-primary-foreground">Click</Button>
<div className="border-border rounded-lg p-4">Content</div>

// ❌ WRONG: Hardcoded colors
<Button style={{ backgroundColor: '#0066cc' }}>Click</Button>
<div className="border-[#e5e5e5] rounded-[8px]">Content</div>
```

**Token compliance is enforced in CI:**
- Run `npm run check:tokens` before committing
- CI will fail if violations are found
- See [`docs/design-tokens.md`](docs/design-tokens.md) for token reference

#### 2. Testing Requirements

**All changes must include tests:**

```bash
# Run tests
npm test

# Check coverage (must meet 80% threshold)
npm run test:coverage
```

**Required tests:**
- Unit tests for utilities and logic
- Integration tests for components
- Accessibility tests (keyboard nav, ARIA, focus)
- Token compliance validation

See [`docs/TESTING.md`](docs/TESTING.md) for testing guidelines.

#### 3. Changeset Required

**Every PR must include a changeset** (unless docs/CI only):

```bash
npm run changeset
```

Select version type:
- **patch** - Bug fixes, minor updates
- **minor** - New features, backward-compatible
- **major** - Breaking changes

Write clear, user-facing description for changelog.

**Skip changeset:** Add `skip-changeset` label for:
- Documentation updates only
- CI/CD configuration
- Development tooling
- Test-only changes

See [`docs/VERSIONING.md`](docs/VERSIONING.md) for versioning guidelines.

#### 4. Code Quality Standards

**TypeScript:**
- Strict mode enabled (no `any` types)
- Proper type definitions
- No `@ts-ignore` without justification

**Linting:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Formatting:**
```bash
npm run format:check  # Check formatting
npm run format        # Auto-format code
```

**Type checking:**
```bash
npm run typecheck
```

#### 5. Accessibility Requirements

**All components must meet WCAG AA:**
- Semantic HTML elements
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Color contrast compliance

Test accessibility:
- Use Storybook's a11y addon
- Test keyboard navigation
- Verify screen reader compatibility

#### 6. Component Guidelines

**Follow the UI contract:**
- No external layout assumptions
- Pass through `className` prop
- Use composition over configuration
- Support `asChild` pattern where appropriate

See [`docs/ui-contract.md`](docs/ui-contract.md) for complete guidelines.

### Release Workflow

**For Contributors:**

1. **Create feature branch**
2. **Implement changes** following standards
3. **Add tests** (unit + integration)
4. **Add changeset** (`npm run changeset`)
5. **Open PR** - CI validates:
   - Linting passes
   - Tests pass (80% coverage)
   - Token compliance passes
   - Changeset present
6. **Address review feedback**
7. **Merge to main** - Automated:
   - Changesets creates "Version Packages" PR
   - Maintainer reviews version bump
   - Merge version PR → Release pipeline runs
   - Package published with git tag

**For Maintainers:**

1. **Review PR** - Check:
   - Code quality and standards
   - Test coverage
   - Token compliance
   - Accessibility
   - Changeset description
2. **Merge PR** to main
3. **Review "Version Packages" PR**:
   - Verify version bump is correct
   - Review CHANGELOG.md entries
   - Ensure all changes are included
4. **Merge version PR** → Triggers release:
   - Stage 1: Test (lint, typecheck, tests, audit, CodeQL)
   - Stage 2: Build (artifacts created)
   - Stage 3: Deploy GREEN (publish to `next`)
   - Stage 4: Validate & Promote (smoke test, promote to `latest`)

See [`docs/VERSIONING.md`](docs/VERSIONING.md) and [`docs/CI-CD.md`](docs/CI-CD.md) for details.

### Token Compliance Rules

**Enforced in CI - violations block merge:**

1. **No hardcoded colors:**
   ```typescript
   // ❌ WRONG
   style={{ color: '#ff0000' }}
   className="text-[#ff0000]"
   
   // ✅ CORRECT
   className="text-destructive"
   ```

2. **No arbitrary spacing:**
   ```typescript
   // ❌ WRONG
   className="p-[24px] m-[16px]"
   
   // ✅ CORRECT
   className="p-6 m-4"
   ```

3. **Use semantic tokens:**
   ```typescript
   // ✅ CORRECT
   className="bg-background text-foreground"
   className="border-border rounded-lg"
   className="focus:ring-ring"
   ```

4. **Exceptions allowed:**
   - Min-width/min-height for component constraints
   - SVG viewBox attributes
   - Data attributes

**Check compliance:**
```bash
npm run check:tokens
```

### Pre-Commit Checklist

Before opening a PR, verify:

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets 80% threshold
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Token compliance passes (`npm run check:tokens`)
- [ ] Changeset added (`npm run changeset`)
- [ ] Storybook stories added/updated (if component change)
- [ ] Accessibility tested
- [ ] Documentation updated

### Getting Help

- **Questions?** Open a discussion on GitHub
- **Bug reports?** Open an issue with reproduction steps
- **Feature requests?** Open an issue with use case
- **Documentation issues?** Open a PR with improvements

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for detailed contribution guidelines.

## Token System

This library uses a **token-based design system** with semantic color tokens that support light and dark modes:

```tsx
// All components use semantic tokens
<Button variant="primary">Primary</Button>
<Alert variant="destructive">Error message</Alert>
<Badge variant="success">Success</Badge>
```

**Key Features:**
- ✅ No hardcoded colors or arbitrary values
- ✅ Automatic dark mode support via `.dark` class
- ✅ Fully customizable via CSS variables
- ✅ Type-safe token utilities

See [`docs/TOKEN-COMPLIANCE.md`](docs/TOKEN-COMPLIANCE.md) for complete token reference and compliance rules.

## Documentation

### For Consumers

- **[CONSUMER-INTEGRATION.md](docs/CONSUMER-INTEGRATION.md)** — Complete integration guide for consuming apps
  - CSS setup and Tailwind configuration
  - Framework-specific setup (Vite, Next.js, CRA)
  - Theming and customization
  - Troubleshooting common issues
- **[TOKEN-COMPLIANCE.md](docs/TOKEN-COMPLIANCE.md)** — Token system reference
  - Available semantic tokens
  - Token compliance rules
  - Customization guide

### For Contributors

- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** — Contribution guidelines
- **[STORYBOOK.md](docs/STORYBOOK.md)** — Storybook development guide
- **[PACKAGING.md](docs/PACKAGING.md)** — Import patterns and tree-shaking
- **[design-tokens.md](docs/design-tokens.md)** — Token philosophy and architecture
- **[COMPONENT-DEVIATIONS.md](docs/COMPONENT-DEVIATIONS.md)** — Changes from shadcn/ui defaults
- **[SECURITY.md](docs/SECURITY.md)** — Security policy

## License

MIT License - see [`LICENSE`](LICENSE) for details.

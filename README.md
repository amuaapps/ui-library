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

```bash
npm install @amuaapps/ui-library
```

## Quick Start

### 1. Import Styles

Import the library's CSS in your application entry point:

```typescript
// src/main.tsx or src/index.tsx
import '@amuaapps/ui-library/styles';
import './index.css'; // Your app styles
```

### 2. Configure Tailwind (Recommended)

If your app uses Tailwind CSS, add the library to your `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

### 3. Use Components

```typescript
import { Button } from '@amuaapps/ui-library';

function App() {
  return (
    <div className="p-8">
      <Button variant="default">Click me</Button>
      <Button variant="destructive" size="lg">Delete</Button>
      <Button variant="outline" size="sm">Cancel</Button>
    </div>
  );
}
```

## Usage

### Import Patterns

The library supports multiple import patterns for optimal bundle size:

```typescript
// Root import (tree-shakeable)
import { Button, useExample, cn } from '@amuaapps/ui-library';

// Subpath imports (explicit)
import { Button } from '@amuaapps/ui-library/components/button';
import { useExample } from '@amuaapps/ui-library/hooks/use-example';
import { cn } from '@amuaapps/ui-library/lib/utils';
```

Both patterns are tree-shakeable and produce identical bundle sizes in production builds. See [`docs/PACKAGING.md`](docs/PACKAGING.md) for detailed information.

### Dark Mode

The library supports dark mode via the `dark` class:

```typescript
function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <Button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </Button>
    </div>
  );
}
```

## Development

### Component Development with Storybook

Storybook is the primary development environment for building and testing components:

```bash
# Start Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook
```

Storybook provides:
- Interactive component playground
- Theme switching (light/dark)
- Live component documentation
- Visual testing environment

See [`docs/STORYBOOK.md`](docs/STORYBOOK.md) for complete Storybook documentation.

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

# Packaging Strategy

**Version:** 1.0.0  
**Status:** Active

## Overview

This library implements a tree-shakeable packaging strategy that enables selective imports for optimal bundle sizes in consuming applications.

## Key Features

### 1. Tree-Shakeable by Default

The library is configured with `"sideEffects": false` in `package.json`, which tells bundlers that all modules are side-effect free and can be safely eliminated if unused.

### 2. Subpath Exports

The package supports both root-level and subpath imports through the `exports` field in `package.json`:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "import": "./dist/components/*.js"
    },
    "./hooks/*": {
      "types": "./dist/hooks/*.d.ts",
      "import": "./dist/hooks/*.js"
    },
    "./lib/*": {
      "types": "./dist/lib/*.d.ts",
      "import": "./dist/lib/*.js"
    }
  }
}
```

### 3. Preserved Module Structure

Vite is configured with `preserveModules: true` to maintain the source directory structure in the build output. This ensures:
- Each component/hook/utility remains a separate module
- Bundlers can perform optimal tree-shaking
- Type declarations map correctly to their modules

## Import Patterns

### Root Import (All Exports)

Import everything from the main entry point:

```typescript
import { Button, useExample, cn } from '@amuaapps/ui-library';
```

**Use case:** When you need multiple exports or don't mind slightly larger bundles.

### Subpath Import (Selective)

Import individual components/hooks/utilities:

```typescript
// Import specific component
import { Button } from '@amuaapps/ui-library/components/button';

// Import specific hook
import { useExample } from '@amuaapps/ui-library/hooks/use-example';

// Import specific utility
import { cn } from '@amuaapps/ui-library/lib/utils';
```

**Use case:** When you want maximum control over bundle size and only need specific exports.

### Category Import

Import all exports from a category:

```typescript
// All components
import * as Components from '@amuaapps/ui-library/components';

// All hooks
import * as Hooks from '@amuaapps/ui-library/hooks';

// All utilities
import * as Utils from '@amuaapps/ui-library/lib';
```

**Use case:** When you need multiple items from a category but not the entire library.

## Bundle Size Optimization

### How Tree-Shaking Works

Modern bundlers (Webpack 5+, Vite, Rollup, esbuild) will:

1. **Analyze imports:** Determine which exports are actually used
2. **Mark unused code:** Flag modules/exports that are never referenced
3. **Eliminate dead code:** Remove unused modules from the final bundle

### Example: Bundle Size Comparison

Given these imports:

```typescript
// Scenario A: Root import (tree-shakeable)
import { Button } from '@amuaapps/ui-library';

// Scenario B: Subpath import (explicit)
import { Button } from '@amuaapps/ui-library/components/button';
```

**Result:** Both scenarios produce identical bundle sizes in production builds because:
- The library has `sideEffects: false`
- Modules are preserved in the build output
- Modern bundlers eliminate unused code

**Recommendation:** Use root imports for convenience. The tree-shaking will handle optimization automatically.

## Type Declarations

Type declarations are generated for all modules and map correctly to both root and subpath imports:

```typescript
// Root import - types resolved from dist/index.d.ts
import { Button } from '@amuaapps/ui-library';

// Subpath import - types resolved from dist/components/button.d.ts
import { Button } from '@amuaapps/ui-library/components/button';
```

TypeScript will provide full IntelliSense and type checking for both patterns.

## Build Output Structure

After running `npm run build`, the `dist/` directory structure mirrors `src/`:

```
dist/
├── index.js
├── index.d.ts
├── components/
│   ├── button.js
│   ├── button.d.ts
│   └── index.js
├── hooks/
│   ├── use-example.js
│   ├── use-example.d.ts
│   └── index.js
└── lib/
    ├── utils.js
    ├── utils.d.ts
    └── index.js
```

This structure enables:
- Stable import paths
- Granular tree-shaking
- Correct type resolution

## Adding New Components

When adding a new component, follow this pattern:

1. **Create the component file:**
   ```typescript
   // src/components/my-component.tsx
   export interface MyComponentProps { /* ... */ }
   export const MyComponent = (props: MyComponentProps) => { /* ... */ };
   ```

2. **Export from category index:**
   ```typescript
   // src/components/index.ts
   export * from './my-component';
   ```

3. **Export from main index:**
   ```typescript
   // src/index.ts
   export * from './components/my-component';
   ```

The build process will automatically:
- Generate the module at `dist/components/my-component.js`
- Generate types at `dist/components/my-component.d.ts`
- Enable subpath import: `@amuaapps/ui-library/components/my-component`

## Verification

To verify the packaging strategy works correctly:

1. **Build the library:**
   ```bash
   npm run build
   ```

2. **Check the dist structure:**
   ```bash
   ls -R dist/
   ```

3. **Verify exports in package.json:**
   ```bash
   cat package.json | grep -A 20 '"exports"'
   ```

4. **Test in a consuming app:**
   ```typescript
   // Try both import patterns
   import { Button } from '@amuaapps/ui-library';
   import { Button } from '@amuaapps/ui-library/components/button';
   ```

## Compatibility

- **Node.js:** 18+ (ESM support required)
- **Bundlers:** Webpack 5+, Vite, Rollup, esbuild, Parcel 2+
- **TypeScript:** 5.0+ (for proper exports field resolution)

## References

- [Node.js Package Exports](https://nodejs.org/api/packages.html#package-entry-points)
- [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)

---

**Last Updated:** January 2026  
**Version:** 1.0.0

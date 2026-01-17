# UI Library Smoke Test

**This is the canonical consumer validation test** that verifies `@amuaapps/ui-library` works correctly when installed as a real npm package.

## Purpose

The smoke test validates the **published package** by:

1. **Real installation** - Installs the library from a packed `.tgz` file (simulates npm registry install)
2. **Root imports** - Components can be imported from the package root (`@amuaapps/ui-library`)
3. **Subpath imports** - Components can be imported via subpath exports (`@amuaapps/ui-library/components/*`)
4. **Styles export** - CSS loads correctly from the package-level styles export
5. **Build success** - The library builds without errors in a consumer project
6. **Export validation** - All import paths match actual `package.json` exports

## Running the Smoke Test

### From Repository Root (Recommended)

Run the complete smoke test from the repository root:

```bash
npm run smoke-test
```

This single command:
1. Builds the library (`npm run build`)
2. Packs it into a `.tgz` file (`npm pack`)
3. Installs the packed library in smoke-test as a real dependency
4. Runs the smoke-test build (`npm test`)

**This is the canonical way to validate the package before publishing.**

### Manual Steps (for debugging)

If you need to run steps individually:

```bash
# 1. Build the library
npm run build

# 2. Pack the library
npm pack

# 3. Install in smoke-test
cd smoke-test
npm install ../amuaapps-ui-library-*.tgz

# 4. Run the test
npm test
```

## What's Being Tested

### Root Import (Package Root Export)

The smoke test imports core components from the package root:

```typescript
import { Button, Card, CardHeader, CardTitle } from '@amuaapps/ui-library';
```

This validates the `"."` export in `package.json`.

### Subpath Imports (Component Exports)

The smoke test imports components using subpath exports:

```typescript
import { Alert, AlertTitle, AlertDescription } from '@amuaapps/ui-library/components/alert';
import { Badge } from '@amuaapps/ui-library/components/badge';
```

This validates the `"./components/*"` export in `package.json`.

### Styles Export

The smoke test imports CSS via the package-level styles export:

```typescript
import '@amuaapps/ui-library/styles';
```

This validates the `"./styles"` export in `package.json` and ensures CSS side effects work correctly.

### Build Validation

The test runs `vite build` to verify:
- All imports resolve correctly
- TypeScript types are available
- CSS is bundled properly
- The build completes without errors
- Tree-shaking works (only imported components are bundled)

## Deterministic Failure

The smoke test **fails deterministically** if:
- An import path is not exported in `package.json`
- CSS doesn't load (build will fail or styles won't apply)
- TypeScript types are missing
- The build process encounters any errors

## CI Integration

The smoke test runs in CI as part of the publish pipeline:

```yaml
- name: Run Smoke Test
  run: npm run smoke-test
```

The pipeline only promotes a release to `latest` if the smoke test passes.

## Troubleshooting

### "Cannot find module" errors

This means an import path is not exported in `package.json`. Either:
1. Add the export to `package.json`, OR
2. Update the import to use a supported path

### Styling not applied

Check that:
1. `@amuaapps/ui-library/styles` is imported in `main.tsx`
2. The `"./styles"` export exists in `package.json`
3. The library's `dist/styles.js` exists after build

### Build fails

Check:
1. TypeScript configuration is correct
2. All peer dependencies are installed (`react`, `react-dom`)
3. The library's `package.json` exports match the import paths used

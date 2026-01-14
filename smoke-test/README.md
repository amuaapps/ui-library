# UI Library Smoke Test

This is a consumer smoke test that verifies the `@amuaapps/ui-library` works correctly when installed as a package.

## Purpose

The smoke test validates:

1. **Selective imports** - Components can be imported via subpath exports
2. **Build success** - The library builds without errors in a consumer project
3. **Token CSS** - Design tokens are correctly applied
4. **Tree-shaking** - Only imported components are bundled

## Running the Smoke Test

### Prerequisites

Build the library first:

```bash
cd ..
npm run build
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the smoke test page.

### Run Build Test

```bash
npm test
```

This runs `vite build` to verify the library can be successfully bundled in a consumer application.

## What's Being Tested

### Subpath Exports

The smoke test imports components using subpath exports:

```typescript
import { Button } from '@amuaapps/ui-library/button';
import { Card } from '@amuaapps/ui-library/card';
import { Alert } from '@amuaapps/ui-library/alert';
```

### Token CSS

The smoke test imports the token CSS:

```typescript
import '@amuaapps/ui-library/styles';
```

And verifies that:
- Design tokens (colors, spacing) are applied
- Components render with correct styling
- Theme system works (light/dark mode)

### Build Output

The build should:
- Complete without errors
- Only include imported components (tree-shaking)
- Include the token CSS
- Produce a working production build

## CI Integration

This smoke test can run in CI:

```bash
# Build the library
npm run build

# Run smoke test
cd smoke-test
npm install
npm test
```

The test passes if the build completes successfully without errors.

## Troubleshooting

### "Cannot find module" errors

Ensure the library is built first:

```bash
cd ..
npm run build
```

### Styling not applied

Check that:
1. `@amuaapps/ui-library/styles` is imported in `main.tsx`
2. The library's `dist/styles/index.css` exists
3. Vite is configured to resolve the library alias

### Build fails

Check:
1. TypeScript configuration is correct
2. All peer dependencies are installed
3. The library's `package.json` exports are configured correctly

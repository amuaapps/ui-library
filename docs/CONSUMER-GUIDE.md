# Consumer Integration Guide

This guide helps you successfully integrate the UI library into your application.

## Quick Start Checklist

- [ ] Configure npm for GitHub Packages
- [ ] Authenticate with GitHub token
- [ ] Install the package
- [ ] Import styles in your app
- [ ] Configure Tailwind CSS (if using)
- [ ] Import and use components

## Step-by-Step Integration

### 1. Authentication Setup

**Create `.npmrc` in your project root:**
```
@amuaapps:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

**Generate GitHub token:**
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scope: `read:packages`
4. Copy token and add to `.npmrc`

### 2. Install Package

```bash
npm install @amuaapps/ui-library
```

### 3. Import Styles

**In your app entry point:**
```typescript
// src/main.tsx (Vite/React)
import '@amuaapps/ui-library/styles';
import './index.css';
```

**Important:** Library styles must come BEFORE your app styles.

### 4. Configure Tailwind

**Add to `tailwind.config.ts`:**
```typescript
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
  // ... rest of config
};
```

### 5. Use Components

```typescript
import { Button, Card } from '@amuaapps/ui-library';

function App() {
  return (
    <div className="p-8">
      <Button variant="default">Click me</Button>
      <Card className="w-96">
        <p>Your first component!</p>
      </Card>
    </div>
  );
}
```

## Import Patterns

### Root Import (Recommended)
```typescript
import { Button, Card, cn } from '@amuaapps/ui-library';
```

### Subpath Import
```typescript
import { Button } from '@amuaapps/ui-library/components/button';
```

Both are tree-shakeable and produce identical bundle sizes.

## Token Usage

### Use Semantic Tokens

```typescript
// ✅ CORRECT
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
</div>

// ❌ WRONG
<div style={{ backgroundColor: '#fff' }}>
  <h1 style={{ color: '#0066cc' }}>Title</h1>
</div>
```

### Available Tokens

- `background` / `foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `destructive` / `destructive-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `card` / `card-foreground`
- `border`, `input`, `ring`

### Customize Tokens

```css
/* src/index.css */
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}

.dark {
  --primary: 220 90% 66%;
}
```

## Dark Mode

### Basic Toggle
```typescript
const [isDark, setIsDark] = useState(false);

return (
  <div className={isDark ? 'dark' : ''}>
    <Button onClick={() => setIsDark(!isDark)}>
      Toggle Theme
    </Button>
  </div>
);
```

### System Preference
```typescript
const [isDark, setIsDark] = useState(() =>
  window.matchMedia('(prefers-color-scheme: dark)').matches
);
```

## Troubleshooting

### Package Not Found (404)
- Verify GitHub token has `read:packages` scope
- Check `.npmrc` configuration
- Ensure you have repository access

### Styles Not Applied
- Verify styles import: `import '@amuaapps/ui-library/styles'`
- Check import order (library styles before app styles)
- Verify Tailwind content includes library path

### TypeScript Errors
- Ensure `@types/react` and `@types/react-dom` are installed
- Check TypeScript version (4.9+ recommended)

### Build Errors
- Clear node_modules and reinstall
- Check for peer dependency conflicts
- Verify bundler configuration

## Framework-Specific Setup

### Vite
```typescript
// src/main.tsx
import '@amuaapps/ui-library/styles';
import './index.css';
```

### Next.js (App Router)
```typescript
// app/layout.tsx
import '@amuaapps/ui-library/styles';
import './globals.css';
```

### Next.js (Pages Router)
```typescript
// pages/_app.tsx
import '@amuaapps/ui-library/styles';
import '../styles/globals.css';
```

## Best Practices

1. **Always use semantic tokens** - No hardcoded colors
2. **Import styles first** - Before your app styles
3. **Configure Tailwind** - Include library in content
4. **Use tree-shaking** - Import only what you need
5. **Test dark mode** - Verify both themes work
6. **Follow accessibility** - Use semantic HTML

## Support

- **Documentation:** See README.md
- **Issues:** GitHub Issues
- **Examples:** Storybook (run `npm run storybook`)

## Next Steps

- Explore components in Storybook
- Read token system documentation
- Review accessibility guidelines
- Check out example implementations

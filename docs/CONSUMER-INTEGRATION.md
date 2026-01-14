# Consumer Integration Guide

**Version:** 1.0.0  
**Status:** Active

## Overview

This guide explains how to integrate `@amuaapps/ui-library` into your React application, including CSS setup and Tailwind configuration.

## Prerequisites

Your consuming application should have:
- **React 18+**
- **Node.js 18+**
- **A bundler** (Vite, Next.js, Webpack, etc.)

## Installation

```bash
npm install @amuaapps/ui-library
```

### Peer Dependencies

The library requires React as a peer dependency:

```bash
npm install react react-dom
```

## CSS Integration

### Step 1: Import Library Styles

The library provides a compiled CSS file that includes:
- Tailwind base styles
- Design tokens (CSS custom properties)
- Component styles

Import this in your application's entry point:

```typescript
// src/main.tsx or src/index.tsx or src/App.tsx
import '@amuaapps/ui-library/styles';
```

**Important:** This import must come **before** any component imports from the library.

### Step 2: Configure Tailwind in Your App (Optional but Recommended)

If your consuming application uses Tailwind CSS, you need to configure it to scan the library's components for class names.

#### Option A: Extend Tailwind Content (Recommended)

Update your `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add this line to scan the library's components
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

#### Option B: Use Library's Tailwind Config (Advanced)

If you want to match the library's exact theme configuration:

```typescript
import type { Config } from 'tailwindcss';
import libraryConfig from '@amuaapps/ui-library/tailwind.config';

const config: Config = {
  ...libraryConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
};

export default config;
```

### Step 3: Ensure CSS Custom Properties Are Available

The library uses CSS custom properties (CSS variables) for theming. These are included in the library's CSS file, but you can override them in your app:

```css
/* src/index.css or src/App.css */
:root {
  /* Override library tokens if needed */
  --primary: 220 90% 56%;
  --radius: 0.75rem;
}
```

## Usage Examples

### Basic Component Usage

```typescript
import { Button } from '@amuaapps/ui-library';

function App() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="destructive" size="lg">Delete</Button>
      <Button variant="outline" size="sm">Cancel</Button>
    </div>
  );
}
```

### Using Utilities

```typescript
import { cn } from '@amuaapps/ui-library/lib/utils';

function MyComponent() {
  return (
    <div className={cn('base-class', someCondition && 'conditional-class')}>
      Content
    </div>
  );
}
```

### Using Hooks

```typescript
import { useExample } from '@amuaapps/ui-library/hooks/use-example';

function Counter() {
  const { count, increment, decrement } = useExample(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## Framework-Specific Setup

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@amuaapps/ui-library'],
  },
});
```

```typescript
// src/main.tsx
import '@amuaapps/ui-library/styles';
import './index.css'; // Your app styles
import App from './App';

// ... rest of your setup
```

### Next.js (App Router)

```typescript
// app/layout.tsx
import '@amuaapps/ui-library/styles';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
  ],
  // ... rest of config
};

export default config;
```

### Next.js (Pages Router)

```typescript
// pages/_app.tsx
import '@amuaapps/ui-library/styles';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

### Create React App

```typescript
// src/index.tsx
import '@amuaapps/ui-library/styles';
import './index.css';
import App from './App';

// ... rest of your setup
```

## Theming and Customization

### Light and Dark Mode

The library supports dark mode via the `dark` class on a parent element:

```typescript
function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <Button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </Button>
      {/* Your app content */}
    </div>
  );
}
```

### Custom Theme Tokens

Override CSS custom properties in your app's CSS:

```css
/* src/index.css */
@import '@amuaapps/ui-library/styles';

:root {
  /* Override primary color */
  --primary: 262 83% 58%;
  --primary-foreground: 210 40% 98%;
  
  /* Override border radius */
  --radius: 1rem;
}

.dark {
  /* Override dark mode colors */
  --primary: 263 70% 50%;
}
```

## TypeScript Support

The library is fully typed. Import types as needed:

```typescript
import type { ButtonProps } from '@amuaapps/ui-library';

// Use in your component props
interface MyComponentProps {
  buttonProps?: ButtonProps;
}
```

## Troubleshooting

### Styles Not Applying

**Issue:** Components render but have no styling.

**Solution:** Ensure you've imported the library's CSS:
```typescript
import '@amuaapps/ui-library/styles';
```

### Tailwind Classes Not Working

**Issue:** Custom Tailwind classes in your app don't work with library components.

**Solution:** Add the library's dist folder to your Tailwind content configuration:
```typescript
content: [
  './src/**/*.{js,ts,jsx,tsx}',
  './node_modules/@amuaapps/ui-library/dist/**/*.{js,mjs}',
],
```

### CSS Custom Properties Not Defined

**Issue:** Console warnings about undefined CSS variables.

**Solution:** The library's CSS must be imported before components are rendered. Check your import order.

### Build Errors with ESM

**Issue:** Build fails with module resolution errors.

**Solution:** Ensure your bundler supports ESM. For older setups, you may need to configure module resolution:

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['@amuaapps/ui-library'],
  },
});
```

## Best Practices

1. **Import CSS once** at the application root
2. **Don't override component internals** — use composition instead
3. **Use the `cn` utility** for conditional classes
4. **Leverage design tokens** for consistency
5. **Test dark mode** if your app supports it

## Minimum Working Example

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@amuaapps/ui-library/styles';
import './index.css';

import { Button } from '@amuaapps/ui-library';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My App</h1>
      <Button>Click me</Button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```css
/* src/index.css */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
```

```typescript
// tailwind.config.ts
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

## Support

For issues or questions:
- **GitHub Issues:** https://github.com/amuaapps/ui-library/issues
- **Documentation:** See [`README.md`](../README.md)

---

**Last Updated:** January 2026  
**Version:** 1.0.0

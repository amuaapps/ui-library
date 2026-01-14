# Storybook Documentation — ui-library

**Document version:** v1.0.0  
**Status:** Active  
**Purpose:** Guide for using Storybook as the primary development and documentation surface

---

## Overview

Storybook serves as the primary development environment and documentation surface for `ui-library`. It provides:

- **Interactive component playground** for development and testing
- **Visual documentation** for all components with live examples
- **Theme switching** to test light/dark mode
- **Token-based styling** that respects the library's design system

---

## Getting Started

### Development Server

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook at `http://localhost:6006/`

### Build Static Documentation

Build a static version of Storybook for deployment:

```bash
npm run build-storybook
```

Output will be in `storybook-static/` directory.

---

## Features

### 1. Theme Switching

Storybook includes a global toolbar control for switching between light and dark themes:

- **Light Theme** (default) - Click the sun icon in the toolbar
- **Dark Theme** - Click the moon icon in the toolbar

The theme switcher applies the `.dark` class to the document root, matching how consumers will implement dark mode in their applications.

### 2. Token CSS Integration

All components in Storybook load the library's token CSS (`src/styles/index.css`), ensuring:

- Components display with correct styling
- Theme switching works properly
- No hardcoded values are introduced
- Visual consistency with production usage

### 3. Component Stories

Each component has a dedicated `.stories.tsx` file that demonstrates:

- **Default usage** - Basic component with default props
- **Variants** - All available variant options
- **Sizes** - All available size options
- **Compositions** - Complex examples showing real-world usage
- **Interactive controls** - Storybook controls for testing props

### 4. TypeScript Support

Storybook is fully configured for TypeScript:

- Type-safe story definitions
- Automatic prop documentation via `react-docgen-typescript`
- IntelliSense support in stories

---

## Writing Stories

### Basic Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './your-component';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary'],
      description: 'The visual style variant',
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Example',
    variant: 'default',
  },
};
```

### Story Best Practices

**1. Use Semantic Tokens**
```tsx
// ✅ Good - uses token classes
<div className="bg-background text-foreground p-4">
  <YourComponent />
</div>

// ❌ Bad - hardcoded values
<div style={{ background: '#fff', color: '#000' }}>
  <YourComponent />
</div>
```

**2. Demonstrate All Variants**
```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
```

**3. Show Real-World Usage**
```tsx
export const FormExample: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign In</Button>
      </CardFooter>
    </Card>
  ),
};
```

**4. Use Layout Utilities**
```tsx
// For spacing between components in stories
<div className="flex gap-4">
  <Component1 />
  <Component2 />
</div>

// For vertical stacking
<div className="space-y-4">
  <Component1 />
  <Component2 />
</div>
```

---

## Configuration

### Main Configuration (`.storybook/main.ts`)

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

**Key Settings:**
- **Stories pattern** - Finds all `.stories.tsx` files in `src/`
- **Framework** - Uses Vite builder for fast development
- **TypeScript** - Generates prop documentation automatically

### Preview Configuration (`.storybook/preview.tsx`)

```typescript
import type { Preview } from '@storybook/react';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    controls: { /* ... */ },
    backgrounds: { disable: true },
    layout: 'centered',
  },
  decorators: [withTheme],
  globalTypes: {
    theme: { /* ... */ },
  },
};
```

**Key Settings:**
- **CSS Import** - Loads token CSS for all stories
- **Theme Decorator** - Applies dark class based on toolbar selection
- **Backgrounds** - Disabled to use token-based backgrounds
- **Layout** - Centers components by default

---

## Token Compliance in Storybook

Storybook must follow the same token compliance rules as the library:

### ✅ Allowed

- Token-based utilities: `bg-background`, `text-foreground`, `border-border`
- Standard Tailwind scale: `p-4`, `gap-2`, `space-y-4`
- CSS variable references: `hsl(var(--primary))`

### ❌ Forbidden

- Hardcoded colors: `#fff`, `rgb(255,0,0)`
- Arbitrary values: `bg-[#ccc]`, `p-[14px]`
- Inline numeric styles: `style={{ padding: '14px' }}`

See `docs/TOKEN-COMPLIANCE.md` for complete rules.

---

## Deployment

### Static Build

The static Storybook build can be deployed to any static hosting service:

```bash
# Build static files
npm run build-storybook

# Deploy to hosting (examples)
# Netlify
netlify deploy --dir=storybook-static --prod

# Vercel
vercel --prod storybook-static

# GitHub Pages
# Push storybook-static/ to gh-pages branch
```

### CI/CD Integration

Add Storybook build to your CI pipeline:

```yaml
# .github/workflows/storybook.yml
name: Storybook

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build-storybook
      - uses: actions/upload-artifact@v4
        with:
          name: storybook-static
          path: storybook-static/
```

---

## Troubleshooting

### Components Not Styling Correctly

**Issue:** Components appear unstyled or use wrong colors

**Solution:** Ensure token CSS is imported in `.storybook/preview.tsx`:
```typescript
import '../src/styles/index.css';
```

### Theme Switching Not Working

**Issue:** Dark mode toggle doesn't change component appearance

**Solution:** Verify the theme decorator is applied and uses the correct class:
```typescript
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  return <Story />;
};
```

### TypeScript Errors in Stories

**Issue:** Type errors when writing stories

**Solution:** Use proper type imports and satisfies operator:
```typescript
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  // ...
} satisfies Meta<typeof YourComponent>;

type Story = StoryObj<typeof meta>;
```

---

## Examples

### Example 1: Button Component

```tsx
// src/components/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Button' },
};
```

### Example 2: Composite Component

```tsx
// src/components/card.stories.tsx
export const LoginForm: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1">Sign In</Button>
      </CardFooter>
    </Card>
  ),
};
```

---

## Resources

- **Storybook Documentation:** https://storybook.js.org/docs
- **Token Compliance:** `docs/TOKEN-COMPLIANCE.md`
- **UI Contract:** `docs/ui-contract.md`
- **Component Deviations:** `docs/COMPONENT-DEVIATIONS.md`

---

## Changelog

- **v1.0.0** — Initial Storybook setup with theme switching and token CSS integration

# Token Compliance Guide — ui-library

**Document version:** v1.0.0  
**Status:** Active  
**Purpose:** Ensure all components follow token-based styling rules

---

## Overview

This library enforces strict token compliance to ensure:
- **Consistent theming** across light and dark modes
- **No hardcoded visual values** in components
- **Easy customization** by consumers via CSS variable overrides

---

## Token Compliance Rules

### ✅ ALLOWED

**1. Semantic token utilities**
```tsx
// Color tokens
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="border-border"

// Spacing from standard scale
className="p-4 gap-2 space-y-6"

// Typography from standard scale
className="text-sm font-medium"

// Border radius from token
className="rounded-md rounded-lg"
```

**2. CSS variable references**
```css
background: hsl(var(--background));
color: hsl(var(--foreground));
```

**3. Standard Tailwind scale utilities**
```tsx
// Spacing scale (0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, etc.)
className="p-4 m-2 gap-6"

// Typography scale
className="text-xs text-sm text-base text-lg text-xl"

// Standard utilities
className="h-px w-px p-px" // 1px values
```

---

### ❌ FORBIDDEN

**1. Hardcoded colors**
```tsx
// NEVER use hex, rgb, hsl literals
className="bg-[#ff0000]"        // ❌
className="text-[rgb(255,0,0)]" // ❌
style={{ color: '#ff0000' }}    // ❌
```

**2. Arbitrary Tailwind values**
```tsx
// NEVER use arbitrary values for styling
className="bg-[#ccc]"      // ❌
className="p-[14px]"       // ❌
className="text-[#333]"    // ❌
className="rounded-[12px]" // ❌
className="gap-[3px]"      // ❌
```

**3. Inline numeric styles**
```tsx
// NEVER use inline numeric values (except CSS variables)
style={{ padding: '14px' }}     // ❌
style={{ fontSize: '15px' }}    // ❌
style={{ borderRadius: '8px' }} // ❌

// CSS variables are OK
style={{ color: 'hsl(var(--primary))' }} // ✅
```

---

## Available Semantic Tokens

### Required Tokens

All components MUST use these semantic tokens:

**Base Colors**
- `--background` / `bg-background`
- `--foreground` / `text-foreground`

**Surface Colors**
- `--card` / `bg-card`
- `--card-foreground` / `text-card-foreground`
- `--popover` / `bg-popover`
- `--popover-foreground` / `text-popover-foreground`

**Brand Colors**
- `--primary` / `bg-primary`
- `--primary-foreground` / `text-primary-foreground`
- `--secondary` / `bg-secondary`
- `--secondary-foreground` / `text-secondary-foreground`

**Muted/Subtle Colors**
- `--muted` / `bg-muted`
- `--muted-foreground` / `text-muted-foreground`
- `--accent` / `bg-accent`
- `--accent-foreground` / `text-accent-foreground`

**Semantic Colors**
- `--destructive` / `bg-destructive`
- `--destructive-foreground` / `text-destructive-foreground`

**Border & Input**
- `--border` / `border-border`
- `--input` / `bg-input`
- `--ring` / `ring-ring`

**Border Radius**
- `--radius` (base value: 0.5rem)

### Optional Tokens

These tokens are available for extended functionality:

**Additional Semantic Colors**
- `--success` / `bg-success`
- `--success-foreground` / `text-success-foreground`
- `--warning` / `bg-warning`
- `--warning-foreground` / `text-warning-foreground`
- `--info` / `bg-info`
- `--info-foreground` / `text-info-foreground`

---

## Dark Mode Support

The library supports dark mode via the `.dark` class:

```tsx
// Toggle dark mode
<div className={isDark ? 'dark' : ''}>
  <YourApp />
</div>
```

All tokens automatically switch to dark mode values when `.dark` is present on a parent element.

---

## Component Compliance Checklist

When creating or modifying components:

- [ ] No hardcoded hex/rgb/hsl colors
- [ ] No arbitrary Tailwind values (`[...]`)
- [ ] All colors use semantic tokens
- [ ] All spacing uses standard Tailwind scale
- [ ] All typography uses standard Tailwind scale
- [ ] Border radius uses token-based utilities
- [ ] Component works in both light and dark modes
- [ ] No inline styles with numeric values (except CSS vars)

---

## Examples

### ✅ Compliant Component

```tsx
import { cn } from '../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        'p-6 space-y-4',
        className
      )}
      {...props}
    />
  );
}
```

### ❌ Non-Compliant Component

```tsx
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[12px] border-[#e5e7eb] bg-[#ffffff]', // ❌ Arbitrary values
        'p-[24px] gap-[16px]',                          // ❌ Arbitrary spacing
        className
      )}
      style={{ color: '#333' }}                         // ❌ Inline color
      {...props}
    />
  );
}
```

---

## Token Customization for Consumers

Consumers can customize tokens by overriding CSS variables:

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  --radius: 0.75rem;
}

.dark {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}
```

See `docs/CONSUMER-INTEGRATION.md` for complete customization guide.

---

## Enforcement

Token compliance is enforced through:

1. **Code review** — All PRs checked for compliance
2. **Linting** — ESLint rules detect common violations
3. **Testing** — Visual regression tests verify theming
4. **Documentation** — This guide and design-tokens.md

---

## Questions?

- See `docs/design-tokens.md` for token philosophy
- See `docs/CONSUMER-INTEGRATION.md` for usage examples
- See `tailwind.config.ts` for complete token mapping

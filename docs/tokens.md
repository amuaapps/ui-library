# Design Token Guidelines

This document defines the rules for using design tokens in the UI library. Following these guidelines ensures components remain themeable and consistent across different applications.

## Core Principle: No Raw Sizing in Core Components

**All core UI components MUST use semantic design tokens instead of hardcoded Tailwind values.** This allows themes to customize the visual appearance without modifying component code.

## Token Categories

### 1. Typography Tokens

**Rule:** Always use `text-ui-*` classes for font sizes in components.

**Available tokens:**

- `text-ui-h1` - Heading level 1
- `text-ui-h2` - Heading level 2
- `text-ui-h3` - Heading level 3
- `text-ui-body` - Standard body text
- `text-ui-body-sm` - Small body text
- `text-ui-label` - Form labels and emphasized text
- `text-ui-button` - Button and interactive element text
- `text-ui-caption` - Captions, hints, and secondary text

**Examples:**

```tsx
// ✅ CORRECT - Uses semantic typography token
<p className="text-ui-body">Standard paragraph text</p>
<button className="text-ui-button">Click me</button>
<label className="text-ui-label">Email address</label>

// ❌ INCORRECT - Uses hardcoded Tailwind size
<p className="text-sm">Standard paragraph text</p>
<button className="text-base">Click me</button>
<label className="text-sm font-semibold">Email address</label>
```

### 2. Control Sizing Tokens

**Rule:** Use `h-ui-control-*` for height and `px-ui-control-px-*` / `py-ui-control-py-*` for padding in form controls and interactive elements.

**Available tokens:**

**Height:**

- `h-ui-control-sm` - Small control height
- `h-ui-control-md` - Medium control height (default)
- `h-ui-control-lg` - Large control height

**Horizontal padding:**

- `px-ui-control-px-sm` - Small horizontal padding
- `px-ui-control-px-md` - Medium horizontal padding (default)
- `px-ui-control-px-lg` - Large horizontal padding

**Vertical padding:**

- `py-ui-control-py-sm` - Small vertical padding
- `py-ui-control-py-md` - Medium vertical padding (default)
- `py-ui-control-py-lg` - Large vertical padding

**Icon-only controls:**

- `size-ui-control-icon` - Square dimensions for icon-only buttons

**Examples:**

```tsx
// ✅ CORRECT - Uses density tokens
<input className="h-ui-control-md px-ui-control-px-md py-ui-control-py-md" />
<button className="h-ui-control-lg px-ui-control-px-lg py-ui-control-py-lg">
  Large Button
</button>
<button className="size-ui-control-icon">
  <Icon />
</button>

// ❌ INCORRECT - Uses hardcoded dimensions
<input className="h-10 px-3 py-2" />
<button className="h-11 px-8 py-2">Large Button</button>
<button className="h-10 w-10">
  <Icon />
</button>
```

### 3. Elevation (Shadow) Tokens

**Rule:** Use `shadow-ui-*` classes for box shadows and elevation effects.

**Available tokens:**

- `shadow-ui-sm` - Subtle elevation (e.g., cards)
- `shadow-ui-md` - Medium elevation (e.g., dropdowns, tooltips)
- `shadow-ui-lg` - Prominent elevation (e.g., dialogs, modals)

**Examples:**

```tsx
// ✅ CORRECT - Uses semantic shadow token
<div className="rounded-lg border shadow-ui-sm">Card content</div>
<div className="popover shadow-ui-md">Dropdown menu</div>
<div className="modal shadow-ui-lg">Dialog content</div>

// ❌ INCORRECT - Uses hardcoded shadow
<div className="rounded-lg border shadow-sm">Card content</div>
<div className="popover shadow-md">Dropdown menu</div>
<div className="modal shadow-lg">Dialog content</div>
```

### 4. Border Radius

**Rule:** Border radius already uses the `--radius` CSS variable via Tailwind's built-in classes. Continue using standard Tailwind radius utilities.

**Available classes:**

- `rounded-sm` - Small radius (calc(var(--radius) - 4px))
- `rounded-md` - Medium radius (calc(var(--radius) - 2px))
- `rounded-lg` - Large radius (var(--radius))
- `rounded-full` - Fully rounded (for circles)

**Note:** These classes automatically reference the `--radius` CSS variable, so they are already themeable.

## When Raw Tailwind Values Are Allowed

Raw Tailwind utility classes (e.g., `h-10`, `px-4`, `text-sm`, `shadow-md`) are **only allowed** in the following scenarios:

### 1. Layout and Spacing

Layout-specific properties that don't affect the core visual identity:

```tsx
// ✅ ALLOWED - Layout spacing
<div className="flex gap-4 p-6">
  <div className="w-1/2">Column 1</div>
  <div className="w-1/2">Column 2</div>
</div>

// ✅ ALLOWED - Grid layouts
<div className="grid grid-cols-3 gap-8">...</div>

// ✅ ALLOWED - Margins for layout
<section className="mt-8 mb-12">...</section>
```

### 2. Positioning and Display

```tsx
// ✅ ALLOWED - Positioning
<div className="absolute top-4 right-4">...</div>
<div className="relative z-10">...</div>

// ✅ ALLOWED - Display utilities
<div className="flex items-center justify-between">...</div>
<div className="hidden md:block">...</div>
```

### 3. Non-Themeable Dimensions

Fixed dimensions that should never change across themes:

```tsx
// ✅ ALLOWED - Icon sizes (when not using size-ui-control-icon)
<Icon className="h-4 w-4" />

// ✅ ALLOWED - Specific layout constraints
<textarea className="min-h-[80px]" />
```

### 4. Story Files and Examples

Raw values are allowed in `.stories.tsx` files for demonstration purposes:

```tsx
// ✅ ALLOWED in stories
export const Example = () => (
  <div className="p-8 space-y-4">
    <Button>Example</Button>
  </div>
);
```

## Enforcement Checklist

Before submitting a component, verify:

- [ ] All typography uses `text-ui-*` tokens
- [ ] All control heights use `h-ui-control-*` tokens
- [ ] All control padding uses `px-ui-control-px-*` and `py-ui-control-py-*` tokens
- [ ] All shadows use `shadow-ui-*` tokens
- [ ] Border radius uses standard Tailwind classes (`rounded-sm/md/lg`)
- [ ] Raw Tailwind values are only used for layout, positioning, or display utilities
- [ ] Component visuals remain stable under `.theme-core` defaults

## Token Configuration

All design tokens are defined as CSS variables in `src/styles/index.css` and mapped to Tailwind utilities in `tailwind.config.ts`.

**Typography tokens:**

```css
/* src/styles/index.css */
--ui-text-body: 1rem;
--ui-text-body-sm: 0.875rem;
--ui-text-label: 0.875rem;
/* ... etc */
```

**Control sizing tokens:**

```css
/* src/styles/index.css */
--ui-control-h-md: 2.5rem;
--ui-control-px-md: 0.75rem;
--ui-control-py-md: 0.5rem;
/* ... etc */
```

**Elevation tokens:**

```css
/* src/styles/index.css */
--ui-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--ui-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--ui-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
/* ... etc */
```

## Benefits of Token-Based Design

1. **Themeability:** Marketing teams can customize typography, sizing, and elevation without touching component code
2. **Consistency:** All components automatically stay aligned with the design system
3. **Maintainability:** Design changes happen in one place (CSS variables)
4. **Scalability:** New themes can be created by swapping CSS variable values
5. **Type Safety:** Tailwind autocomplete works with semantic token classes

## Questions?

If you're unsure whether to use a token or a raw Tailwind value, ask yourself:

- **Does this affect the visual identity?** → Use a token
- **Is this purely for layout/positioning?** → Raw Tailwind is OK
- **Should themes be able to customize this?** → Use a token
- **Is this a fixed dimension that never changes?** → Raw Tailwind is OK

When in doubt, prefer tokens over raw values.

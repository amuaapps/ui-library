# UI Token Contract v1 (Core + Marketing Themes)

This contract defines the **minimum required design tokens** that every theme must implement so that **one shared React component set** can render in different visual styles (e.g., **core product** vs **marketing**) without forking component code.

It is designed to be:
- **Small (≈45 required tokens)** but extensible
- **Themeable via CSS variables**
- **Compatible with Tailwind** (map tokens into `tailwind.config.ts`)

---

## 1) Naming and usage rules

### 1.1 Token format
- Tokens are CSS custom properties (CSS variables).
- Prefixes:
  - `--<existing>`: existing color tokens already used by the library (kept for compatibility)
  - `--ui-*`: new tokens introduced by this contract

### 1.2 Where tokens are used
- **Core components may rely only on:**
  - Required tokens in this contract
  - Existing color tokens already used in the codebase (listed below)
- **Core components must not:**
  - Hardcode brand-ish values (font sizes, shadows, radii, durations) when a token exists
  - Introduce marketing-only tokens (those belong in marketing packages/themes)

### 1.3 Theme switching
A theme is applied by setting a class on the app root:

```html
<html class="theme-core">…</html>
<!-- or -->
<html class="theme-marketing">…</html>
```

Each theme defines tokens under its selector:

```css
:root, .theme-core { … }      /* default */
.theme-marketing { … }        /* overrides */
```

---

## 2) Required tokens

### 2.1 Existing required color tokens (already in the library)

These are already used by Tailwind color mappings and must exist in every theme:

```css
--background
--foreground

--card
--card-foreground
--popover
--popover-foreground

--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground

--destructive
--destructive-foreground
--success
--success-foreground
--warning
--warning-foreground
--info
--info-foreground

--border
--input
--ring
```

> Note: The library uses `hsl(var(--token))` mappings, so values should be like `222.2 84% 4.9%`.

---

### 2.2 Core geometry and elevation

```css
/* Radius (Tailwind often references --radius) */
--radius

/* Shadows (used via Tailwind `shadow-*` mappings) */
--ui-shadow-sm
--ui-shadow-md
--ui-shadow-lg
```

---

### 2.3 Typography

#### Font families
```css
--ui-font-sans
--ui-font-mono
```

#### Font sizes (semantic roles)
```css
--ui-text-body        /* default body text */
--ui-text-body-sm     /* small body text (helper text, dense areas) */
--ui-text-label       /* labels */
--ui-text-button      /* buttons */
--ui-text-caption     /* captions / metadata */
--ui-text-h1
--ui-text-h2
--ui-text-h3
```

#### Line heights (matching roles)
```css
--ui-leading-body
--ui-leading-body-sm
--ui-leading-label
--ui-leading-button
--ui-leading-caption
--ui-leading-h1
--ui-leading-h2
--ui-leading-h3
```

#### Font weights
```css
--ui-weight-normal    /* e.g. 400 */
--ui-weight-medium    /* e.g. 500 */
--ui-weight-semibold  /* e.g. 600 */
```

---

### 2.4 Control sizing (density)

These tokens control the overall “density” of form controls and buttons.

#### Heights
```css
--ui-control-h-sm
--ui-control-h-md
--ui-control-h-lg
```

#### Horizontal padding
```css
--ui-control-px-sm
--ui-control-px-md
--ui-control-px-lg
```

#### Vertical padding (only if needed; many controls are height-driven)
```css
--ui-control-py-sm
--ui-control-py-md
--ui-control-py-lg
```

#### Icon button size (square buttons, icon-only controls)
```css
--ui-control-icon
```

---

### 2.5 Focus, borders, and motion

```css
/* Border widths */
--ui-border-w
--ui-border-w-strong

/* Focus ring widths */
--ui-ring-w
--ui-ring-offset-w

/* Motion */
--ui-duration-fast
--ui-duration-normal
--ui-duration-slow

--ui-ease-standard
--ui-ease-emphasized
```

---

## 3) Recommended default values (core theme)

These defaults are intentionally conservative. Marketing can override with bigger type, stronger shadows, larger radii, different motion, etc.

```css
:root, .theme-core {
  /* ----- Geometry ----- */
  --radius: 0.5rem;

  /* ----- Elevation ----- */
  --ui-shadow-sm: 0 1px 2px 0 hsl(var(--foreground) / 0.06);
  --ui-shadow-md: 0 6px 16px -8px hsl(var(--foreground) / 0.18);
  --ui-shadow-lg: 0 14px 40px -18px hsl(var(--foreground) / 0.28);

  /* ----- Typography ----- */
  --ui-font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  --ui-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  --ui-text-body: 1rem;
  --ui-text-body-sm: 0.875rem;
  --ui-text-label: 0.875rem;
  --ui-text-button: 0.875rem;
  --ui-text-caption: 0.75rem;
  --ui-text-h1: 2rem;
  --ui-text-h2: 1.5rem;
  --ui-text-h3: 1.25rem;

  --ui-leading-body: 1.5rem;
  --ui-leading-body-sm: 1.25rem;
  --ui-leading-label: 1.25rem;
  --ui-leading-button: 1.25rem;
  --ui-leading-caption: 1rem;
  --ui-leading-h1: 2.25rem;
  --ui-leading-h2: 2rem;
  --ui-leading-h3: 1.75rem;

  --ui-weight-normal: 400;
  --ui-weight-medium: 500;
  --ui-weight-semibold: 600;

  /* ----- Density ----- */
  --ui-control-h-sm: 2.25rem; /* 36px */
  --ui-control-h-md: 2.5rem;  /* 40px */
  --ui-control-h-lg: 2.75rem; /* 44px */

  --ui-control-px-sm: 0.75rem; /* 12px */
  --ui-control-px-md: 1rem;    /* 16px */
  --ui-control-px-lg: 1.25rem; /* 20px */

  --ui-control-py-sm: 0.5rem;   /* 8px */
  --ui-control-py-md: 0.625rem; /* 10px */
  --ui-control-py-lg: 0.75rem;  /* 12px */

  --ui-control-icon: 2.5rem; /* square icon button */

  /* ----- Borders & focus ----- */
  --ui-border-w: 1px;
  --ui-border-w-strong: 2px;

  --ui-ring-w: 2px;
  --ui-ring-offset-w: 2px;

  /* ----- Motion ----- */
  --ui-duration-fast: 120ms;
  --ui-duration-normal: 180ms;
  --ui-duration-slow: 260ms;

  --ui-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ui-ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 4) Tailwind mapping recommendations

These mappings let components use **semantic Tailwind utilities** rather than `text-sm`, `h-10`, etc.

### 4.1 Typography
Map semantic font sizes to tokens:

- `text-ui-body`
- `text-ui-body-sm`
- `text-ui-label`
- `text-ui-button`
- `text-ui-caption`
- `text-ui-h1`, `text-ui-h2`, `text-ui-h3`

### 4.2 Control sizing
Map:
- `h-ui-control-sm|md|lg`
- `px-ui-control-px-sm|md|lg`
- `py-ui-control-py-sm|md|lg`
- `size-ui-control-icon` (square)

### 4.3 Elevation
Map:
- `shadow-ui-sm|md|lg`

### 4.4 Border and ring widths
Option A (recommended): add **new semantic keys** (e.g. `border-ui`, `ring-ui`) and use them in components.
Option B: replace Tailwind’s `border`/`ring-2` values with CSS vars (affects all usages).

---

## 5) Optional extensions (NOT required by core)

These are good candidates for a marketing-only theme/component package, but core should not depend on them:

- `--ui-accent-gradient-*`
- `--ui-glow-*`
- `--ui-hero-*` (hero typography distinct from product)
- Decorative background patterns / textures

---

## 6) Migration guidance (high-level)

1. Add required tokens to the **core theme** CSS (e.g., `src/styles/index.css`) under `:root, .theme-core`.
2. Map them in `tailwind.config.ts`.
3. Replace hardcoded typography (`text-sm`, `text-lg`, …) in components with semantic classes.
4. Replace hardcoded control sizes (`h-10 px-4 …`) with semantic height/padding classes.
5. Add a token-contract CI check so both `theme-core` and future `theme-marketing` stay compliant.

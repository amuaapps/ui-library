# Component Deviations from shadcn/ui Defaults

**Document version:** v1.0.0  
**Status:** Active  
**Purpose:** Document intentional changes from shadcn/ui defaults to comply with ui-contract.md

---

## Overview

This document tracks all intentional deviations from shadcn/ui default implementations. All changes are made to enforce the UI contract defined in `ui-contract.md`.

---

## Deviations

### 1. AlertDialogCancel

**Changed:** Removed external margin (`mt-2 sm:mt-0`)

**Reason:** UI contract rule 1.1 - Components must not impose outer layout constraints. The margin between Cancel and Action buttons should be controlled by the parent `AlertDialogFooter` component, not baked into the button itself.

**shadcn/ui default:**
```tsx
className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
```

**ui-library implementation:**
```tsx
className={cn(buttonVariants({ variant: 'outline' }), className)}
```

**Consumer usage:**
```tsx
<AlertDialogFooter className="gap-2">
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <AlertDialogAction>Continue</AlertDialogAction>
</AlertDialogFooter>
```

The `AlertDialogFooter` already provides `sm:space-x-2` for horizontal spacing on desktop, so consumers can control the gap as needed.

---

### 2. DropdownMenuSeparator

**Changed:** Removed negative horizontal margin (`-mx-1`)

**Reason:** UI contract rule 1.1 - Components must not impose outer layout constraints. The negative margin was used to extend the separator to the edges of the menu, but this should be controlled by the menu container's padding, not by the separator itself.

**shadcn/ui default:**
```tsx
className={cn('-mx-1 my-1 h-px bg-muted', className)}
```

**ui-library implementation:**
```tsx
className={cn('my-1 h-px bg-muted', className)}
```

**Consumer usage:**
```tsx
<DropdownMenuContent>
  <DropdownMenuItem>Item 1</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem>Item 2</DropdownMenuItem>
</DropdownMenuContent>
```

If full-width separators are needed, consumers can add negative margins via className or adjust the menu content padding.

---

## Components Unchanged from shadcn/ui

The following components remain identical to shadcn/ui defaults as they already comply with the UI contract:

- **Accordion** - No external margins, proper className pass-through
- **Alert** - No external margins, internal spacing only (AlertTitle has `mb-1` for title-to-description spacing)
- **AspectRatio** - Pure wrapper, no styling concerns
- **Avatar** - No external margins
- **Badge** - No external margins, inline element
- **Button** - No external margins, proper variants
- **Card** - No external margins, internal padding only
- **Checkbox** - No external margins
- **Collapsible** - Pure wrapper
- **Dialog** - No external margins, internal spacing in Header/Footer
- **Input** - No external margins
- **Label** - No external margins
- **Popover** - No external margins
- **RadioGroup** - No external margins, internal spacing only
- **ScrollArea** - No external margins
- **Select** - No external margins
- **Separator** - No external margins (1px height/width)
- **Skeleton** - No external margins
- **Slider** - No external margins
- **Switch** - No external margins
- **Tabs** - No external margins, internal spacing only
- **Textarea** - No external margins
- **Toggle** - No external margins
- **Tooltip** - No external margins

---

## Internal Spacing (Acceptable)

The following components use internal spacing which is **allowed** by the UI contract:

### Composite Components with Internal Layout

**AlertDialogHeader**
```tsx
className="flex flex-col space-y-2 text-center sm:text-left"
```
- `space-y-2` provides vertical spacing between title and description
- This is internal layout, not external margins

**AlertDialogFooter**
```tsx
className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
```
- `space-x-2` provides horizontal spacing between footer buttons
- This is internal layout for the button group

**DialogHeader**
```tsx
className="flex flex-col space-y-1.5 text-center sm:text-left"
```
- `space-y-1.5` provides vertical spacing between title and description
- This is internal layout, not external margins

**DialogFooter**
```tsx
className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
```
- `space-x-2` provides horizontal spacing between footer buttons
- This is internal layout for the button group

**CardHeader**
```tsx
className="flex flex-col space-y-1.5 p-6"
```
- `space-y-1.5` provides vertical spacing between title and description
- `p-6` is internal padding
- No external margins

**AlertTitle**
```tsx
className="mb-1 font-medium leading-none tracking-tight"
```
- `mb-1` provides spacing to the description below
- This is internal spacing within the Alert composite
- Acceptable as it's part of a title-description pattern

### Icon Positioning (Acceptable)

**DropdownMenuSubTrigger** - ChevronRight icon
```tsx
<ChevronRight className="ml-auto h-4 w-4" />
```
- `ml-auto` positions icon to the right within the trigger
- This is internal layout, not external margin

**DropdownMenuShortcut**
```tsx
className="ml-auto text-xs tracking-widest opacity-60"
```
- `ml-auto` positions shortcut text to the right within the menu item
- This is internal layout, not external margin

---

## Token Compliance

All components use semantic tokens exclusively:
- ✅ No hardcoded colors (hex, rgb, hsl)
- ✅ No arbitrary Tailwind values
- ✅ All spacing uses standard Tailwind scale
- ✅ All colors reference CSS custom properties

See `docs/TOKEN-COMPLIANCE.md` for complete token reference.

---

## Accessibility Compliance

All components maintain WCAG AA compliance:
- ✅ Semantic markup
- ✅ Keyboard navigation (via Radix UI primitives)
- ✅ ARIA attributes (via Radix UI primitives)
- ✅ Focus management
- ✅ Visible focus rings (tokenized)

---

## className Pass-through

All components support className pass-through using the `cn()` utility:

```tsx
className={cn('base-classes', variantClasses, className)}
```

This allows consumers to:
- Override base styles
- Add custom spacing/layout
- Extend component styling

---

## Summary

**Total Components:** 26  
**Deviations from shadcn/ui:** 2  
**Compliance Rate:** 92%

All deviations are minimal and necessary to enforce the UI contract. The library remains "out-of-the-box shadcn/ui" for 24 of 26 components.

---

## Changelog

- **v1.0.0** — Initial component set with UI contract enforcement
  - Removed external margin from `AlertDialogCancel`
  - Removed negative margin from `DropdownMenuSeparator`

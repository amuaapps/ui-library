# Contributing to UI Library

Thank you for your interest in contributing to the Amua Apps UI Library!

## Code of Conduct

This project adheres to professional standards of conduct. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**: `npm install`
3. **Create a branch** for your feature or fix: `git checkout -b feature/your-feature-name`

## Development Workflow

### Prerequisites

- Node.js 18+ and npm
- Familiarity with React, TypeScript, and modern component patterns

### Local Development

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

## Standards & Requirements

All contributions **MUST** comply with the following documents:

- **[`docs/agents.md`](./agents.md)** — Coding standards, TypeScript requirements, testing standards
- **[`docs/ui-contract.md`](./ui-contract.md)** — Component behavior and composition rules
- **[`docs/design-tokens.md`](./design-tokens.md)** — Token system and compliance rules
- **[`docs/brand-contract.md`](./brand-contract.md)** — Brand identity representation

### Key Requirements

1. **TypeScript strict mode** — No `any` types, no `//@ts-ignore` without justification
2. **Token-first styling** — No hardcoded colors, spacing, or arbitrary Tailwind values
3. **Accessibility** — All components must meet WCAG AA minimum
4. **Tests required** — Unit tests for logic, integration tests for critical paths
5. **Coverage thresholds** — 80%+ line and branch coverage enforced
6. **No console logs** — Use proper error handling instead

## Code Style

- **Files**: `kebab-case.ts` or `kebab-case.tsx`
- **Components**: `PascalCase.tsx`
- **Variables/functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`

Formatting is enforced via Prettier and runs automatically on commit via husky + lint-staged.

## Pull Request Process

1. **Ensure all checks pass**:
   - TypeScript compilation (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Formatting (`npm run format:check`)
   - Tests (`npm test`)
   - Coverage thresholds met

2. **Write clear commit messages**:
   - Use conventional commit format: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
   - Example: `feat: add Button component with variants`

3. **Update documentation**:
   - Add/update component documentation
   - Update README if adding new features
   - Add tests demonstrating usage

4. **Submit PR**:
   - Provide clear description of changes
   - Reference any related issues
   - Ensure CI pipeline passes

## Component Development Guidelines

### Creating a New Component

1. Create component file in `src/components/` (e.g., `button.tsx`)
2. Export from `src/components/index.ts`
3. Create test file in `tests/unit/components/` (e.g., `button.test.tsx`)
4. Follow composition principles from `ui-contract.md`:
   - Accept `className` prop
   - Use semantic tokens only
   - No external layout assumptions
   - Support variants via props

### Testing Requirements

Every component must have:
- **Unit tests** for props, variants, and behavior
- **Accessibility tests** (keyboard nav, ARIA attributes, focus management)
- **Integration tests** for complex interactions (if applicable)

Example test structure:
```typescript
describe('Button', () => {
  it('renders with default variant', () => { /* ... */ });
  it('applies custom className', () => { /* ... */ });
  it('handles click events', () => { /* ... */ });
  it('is keyboard accessible', () => { /* ... */ });
  it('is disabled when disabled prop is true', () => { /* ... */ });
});
```

## Token Compliance

**All styling must use design tokens.** The following are **forbidden**:

- ❌ Hardcoded colors: `bg-blue-500`, `#3b82f6`, `rgb(59, 130, 246)`
- ❌ Arbitrary values: `p-[14px]`, `text-[18px]`, `rounded-[12px]`
- ❌ Inline styles with literals: `style={{ padding: '14px' }}`

**Allowed**:
- ✅ Semantic tokens: `bg-primary`, `text-foreground`, `border-input`
- ✅ Token-based utilities: `p-4`, `text-lg`, `rounded-md`
- ✅ CSS variables: `var(--primary)`

## Questions?

If you have questions about contributing:
- Review the documentation in `/docs`
- Open a discussion on GitHub
- Reach out to maintainers

Thank you for contributing to Amua Apps UI Library!

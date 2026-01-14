# Testing Strategy

This document describes the testing approach for the UI library, including unit tests, integration tests, and accessibility validation.

## Overview

The library uses **Jest** and **React Testing Library** for comprehensive testing with the following goals:

- ✅ **Deterministic tests** that pass consistently in CI
- ✅ **80% coverage threshold** for tested code
- ✅ **Accessibility validation** for interactive components
- ✅ **Token compliance verification** to prevent hardcoded values
- ✅ **Meaningful tests** that validate actual behavior, not implementation details

## Test Structure

```
tests/
├── unit/                    # Unit tests for utilities and variants
│   ├── utils.test.ts       # cn() utility tests
│   └── button-variants.test.ts  # Button variant generation tests
├── integration/             # Integration tests for components
│   ├── Button.test.tsx     # Button component tests
│   ├── Card.test.tsx       # Card component tests
│   ├── Input.test.tsx      # Input component tests
│   └── Dialog.test.tsx     # Dialog component tests
└── setup.ts                 # Test environment setup
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Coverage Thresholds

Coverage thresholds are enforced at **80%** for:
- Statements
- Branches
- Functions
- Lines

**Note:** Coverage is only enforced on tested components to ensure quality over quantity. As more components are tested, they are added to the coverage collection.

## Test Categories

### 1. Unit Tests

Unit tests validate individual functions and utilities in isolation.

**Example: `cn()` utility**
```typescript
describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('merges Tailwind classes correctly (deduplication)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
```

**Example: Button variants**
```typescript
describe('buttonVariants', () => {
  it('generates default variant classes', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).toContain('bg-primary');
  });

  it('uses semantic color tokens (no hardcoded colors)', () => {
    const classes = buttonVariants({ variant: 'default' });
    expect(classes).not.toMatch(/#[0-9a-f]{3,6}/i);
  });
});
```

### 2. Integration Tests

Integration tests validate component behavior, rendering, and user interactions.

**Test Structure:**
- **Rendering** - Component renders correctly with various props
- **Variants** - All variants render with correct styles
- **Interactions** - User interactions work as expected
- **States** - Disabled, error, and other states work correctly
- **Accessibility** - ARIA attributes, keyboard navigation, focus management
- **Token Compliance** - No hardcoded colors or spacing values

**Example: Button component**
```typescript
describe('Button Component', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

### 3. Accessibility Tests

All interactive components include accessibility validation:

**Keyboard Navigation:**
```typescript
it('is keyboard accessible', async () => {
  render(<Input />);
  const input = screen.getByRole('textbox');
  
  await userEvent.tab();
  expect(input).toHaveFocus();
});
```

**ARIA Attributes:**
```typescript
it('supports aria-label', () => {
  render(<Button aria-label="Close dialog">X</Button>);
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
});
```

**Focus Management:**
```typescript
it('traps focus within dialog', async () => {
  // Test that focus stays within dialog when tabbing
  await user.tab();
  expect([button1, button2, closeButton]).toContain(document.activeElement);
});
```

**Disabled States:**
```typescript
it('has disabled attribute when disabled', () => {
  render(<Button disabled>Disabled</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

### 4. Token Compliance Tests

Every component test includes token compliance validation to prevent hardcoded values:

**Color Tokens:**
```typescript
it('uses semantic color tokens', () => {
  render(<Button variant="default">Button</Button>);
  const button = screen.getByRole('button');
  
  // Should use token classes
  expect(button.className).toMatch(/bg-(primary|secondary|destructive)/);
  
  // Should NOT use hardcoded colors
  expect(button.className).not.toMatch(/#[0-9a-f]{3,6}/i);
  expect(button.className).not.toMatch(/rgb\(/);
});
```

**Spacing Tokens:**
```typescript
it('uses spacing tokens', () => {
  render(<Input />);
  const input = screen.getByRole('textbox');
  
  // Should use token classes
  expect(input.className).toMatch(/px-\d+/);
  
  // Should NOT use arbitrary values
  expect(input.className).not.toMatch(/\[\d+px\]/);
});
```

## Test Coverage

### Currently Tested Components

| Component | Unit Tests | Integration Tests | Accessibility | Token Compliance |
|-----------|-----------|-------------------|---------------|------------------|
| `cn()` utility | ✅ | N/A | N/A | N/A |
| Button | ✅ (variants) | ✅ | ✅ | ✅ |
| Card | ❌ | ✅ | ✅ | ✅ |
| Input | ❌ | ✅ | ✅ | ✅ |
| Dialog | ❌ | ✅ | ✅ | ✅ |

### Representative Coverage

The test suite focuses on **representative components** that demonstrate:

1. **Simple components** (Button, Badge) - Basic rendering and variants
2. **Form components** (Input, Checkbox) - User input and validation
3. **Composite components** (Card, Dialog) - Complex composition patterns
4. **Interactive components** (Dialog, Dropdown) - Focus management and keyboard navigation

This approach ensures:
- ✅ Critical utilities are thoroughly tested
- ✅ Each component pattern has test coverage
- ✅ Accessibility patterns are validated
- ✅ Token compliance is enforced
- ✅ Tests remain maintainable and meaningful

## Writing New Tests

### Guidelines

1. **Test behavior, not implementation**
   - ✅ Test what the user sees and does
   - ❌ Don't test internal state or implementation details

2. **Use semantic queries**
   - ✅ `getByRole`, `getByLabelText`, `getByText`
   - ❌ `getByTestId`, `querySelector`

3. **Test accessibility**
   - Always include keyboard navigation tests
   - Verify ARIA attributes
   - Test disabled states
   - Validate focus management

4. **Validate token compliance**
   - Check for semantic token classes
   - Ensure no hardcoded colors (`#`, `rgb()`)
   - Ensure no arbitrary spacing values (`[12px]`)

5. **Keep tests deterministic**
   - Avoid timing-dependent assertions
   - Use `waitFor` for async operations
   - Clean up after each test

### Example Test Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '@/components/component-name';

describe('ComponentName', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<ComponentName>Content</ComponentName>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('handles user interaction', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ComponentName onClick={handleClick} />);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ComponentName />);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('has proper ARIA attributes', () => {
      render(<ComponentName aria-label="Label" />);
      expect(screen.getByLabelText('Label')).toBeInTheDocument();
    });
  });

  describe('token compliance', () => {
    it('uses semantic color tokens', () => {
      render(<ComponentName />);
      const element = screen.getByRole('button');
      
      expect(element.className).not.toMatch(/#[0-9a-f]{3,6}/i);
      expect(element.className).toMatch(/bg-(primary|secondary)/);
    });
  });
});
```

## CI Integration

Tests run automatically in CI on every commit:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

**CI Requirements:**
- ✅ All tests must pass
- ✅ Coverage thresholds must be met
- ✅ No console errors or warnings (except expected ones)

## Troubleshooting

### Common Issues

**Issue: Tests fail locally but pass in CI**
- Clear Jest cache: `npx jest --clearCache`
- Ensure dependencies are up to date: `npm install`

**Issue: Coverage threshold not met**
- Add tests for uncovered code paths
- Or exclude the file from coverage if it's not critical

**Issue: Async tests timing out**
- Increase timeout: `jest.setTimeout(10000)`
- Use `waitFor` instead of fixed delays
- Check for missing `await` keywords

**Issue: Tests are flaky**
- Avoid timing-dependent assertions
- Use `userEvent` instead of `fireEvent`
- Ensure proper cleanup between tests

## Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** that explain what is being tested
3. **Arrange-Act-Assert** pattern for test structure
4. **Clean up side effects** using `afterEach`
5. **Mock external dependencies** to keep tests isolated
6. **Test edge cases** and error states
7. **Keep tests fast** - avoid unnecessary delays

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/input';

describe('Input Component', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('renders with default value', () => {
      render(<Input defaultValue="Default text" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Default text');
    });
  });

  describe('input types', () => {
    it('renders as text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders as email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders as number input', () => {
      render(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    it('handles onChange events', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles onFocus events', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();
    });

    it('handles onBlur events', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('can be disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'test');
      expect(input.value).toBe('');
    });

    it('can be readonly', () => {
      render(<Input readOnly value="Read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('can be required', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('accessibility', () => {
    it('has textbox role', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <span id="helper-text">Helper text</span>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('supports aria-invalid for error states', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.tab();
      expect(input).toHaveFocus();
    });
  });

  describe('token compliance', () => {
    it('uses semantic color tokens', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input.className).toContain('border-input');
      expect(input.className).toContain('bg-background');
    });

    it('uses spacing tokens', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input.className).toMatch(/px-\d+/);
      expect(input.className).toMatch(/py-\d+/);
      expect(input.className).not.toMatch(/\[\d+px\]/);
    });

    it('uses border radius tokens', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      
      expect(input.className).toContain('rounded-md');
      expect(input.className).not.toMatch(/rounded-\[\d+px\]/);
    });
  });
});

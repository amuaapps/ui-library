import { render, screen } from '@testing-library/react';
import { TopNavigation } from '../../src/components/top-navigation';

describe('TopNavigation', () => {
  it('renders with default logo placeholder', () => {
    render(<TopNavigation />);
    const logo = screen.getByText('L');
    expect(logo).toBeInTheDocument();
  });

  it('renders with custom logo', () => {
    render(
      <TopNavigation
        logo={<div data-testid="custom-logo">Custom Logo</div>}
      />
    );
    const customLogo = screen.getByTestId('custom-logo');
    expect(customLogo).toBeInTheDocument();
    expect(customLogo).toHaveTextContent('Custom Logo');
  });

  it('renders burger menu button', () => {
    render(<TopNavigation />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TopNavigation className="custom-class" />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('has sticky positioning and proper z-index', () => {
    const { container } = render(<TopNavigation />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('sticky');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('z-50');
  });

  it('spans full width', () => {
    const { container } = render(<TopNavigation />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('w-full');
  });

  it('has elevation shadow', () => {
    const { container } = render(<TopNavigation />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('shadow-ui-sm');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<TopNavigation ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('spreads additional props to nav element', () => {
    render(<TopNavigation data-testid="test-nav" aria-label="Main navigation" />);
    const nav = screen.getByTestId('test-nav');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
});

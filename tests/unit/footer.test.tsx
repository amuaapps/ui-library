import { render, screen } from '@testing-library/react';
import { Footer } from '../../src/components/footer';

describe('Footer', () => {
  it('renders with default logo placeholder', () => {
    render(<Footer />);
    const logo = screen.getByText('L');
    expect(logo).toBeInTheDocument();
  });

  it('renders with custom logo', () => {
    render(
      <Footer
        logo={<div data-testid="custom-logo">Custom Logo</div>}
      />
    );
    const customLogo = screen.getByTestId('custom-logo');
    expect(customLogo).toBeInTheDocument();
    expect(customLogo).toHaveTextContent('Custom Logo');
  });

  it('renders default copyright text', () => {
    render(<Footer />);
    const copyright = screen.getByText(/© Amua Apps 2026/i);
    expect(copyright).toBeInTheDocument();
  });

  it('renders custom copyright text', () => {
    render(<Footer copyrightText="© 2026 Custom Company" />);
    const copyright = screen.getByText(/© 2026 Custom Company/i);
    expect(copyright).toBeInTheDocument();
  });

  it('renders default links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders custom links', () => {
    const customLinks = [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
    ];
    render(<Footer links={customLinks} />);
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /privacy/i })).not.toBeInTheDocument();
  });

  it('renders correct number of custom links', () => {
    const customLinks = [
      { label: 'Link 1', href: '#1' },
      { label: 'Link 2', href: '#2' },
      { label: 'Link 3', href: '#3' },
      { label: 'Link 4', href: '#4' },
    ];
    render(<Footer links={customLinks} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
  });

  it('applies custom className', () => {
    const { container } = render(<Footer className="custom-class" />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('has full width', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('w-full');
  });

  it('has muted background in light mode', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-muted');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Footer ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('spreads additional props to footer element', () => {
    render(<Footer data-testid="test-footer" aria-label="Site footer" />);
    const footer = screen.getByTestId('test-footer');
    expect(footer).toHaveAttribute('aria-label', 'Site footer');
  });

  it('links have correct href attributes', () => {
    const customLinks = [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ];
    render(<Footer links={customLinks} />);
    const aboutLink = screen.getByRole('link', { name: /about/i });
    const contactLink = screen.getByRole('link', { name: /contact/i });
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from '../../src/components/hero';

describe('Hero', () => {
  it('renders headline', () => {
    render(<Hero headline="Test Headline" />);
    const headline = screen.getByRole('heading', { name: /test headline/i });
    expect(headline).toBeInTheDocument();
  });

  it('renders subheadline when provided', () => {
    render(<Hero headline="Test Headline" subheadline="Test Subheadline" />);
    expect(screen.getByText(/test subheadline/i)).toBeInTheDocument();
  });

  it('does not render subheadline when not provided', () => {
    const { container } = render(<Hero headline="Test Headline" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('renders primary action button', () => {
    const onClick = jest.fn();
    render(
      <Hero
        headline="Test Headline"
        primaryAction={{ label: 'Primary Button', onClick }}
      />
    );
    expect(screen.getByRole('button', { name: /primary button/i })).toBeInTheDocument();
  });

  it('renders secondary action button', () => {
    const onClick = jest.fn();
    render(
      <Hero
        headline="Test Headline"
        secondaryAction={{ label: 'Secondary Button', onClick }}
      />
    );
    expect(screen.getByRole('button', { name: /secondary button/i })).toBeInTheDocument();
  });

  it('renders both action buttons', () => {
    render(
      <Hero
        headline="Test Headline"
        primaryAction={{ label: 'Primary', onClick: jest.fn() }}
        secondaryAction={{ label: 'Secondary', onClick: jest.fn() }}
      />
    );
    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument();
  });

  it('calls onClick when primary action is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Hero
        headline="Test Headline"
        primaryAction={{ label: 'Click Me', onClick }}
      />
    );
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when secondary action is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Hero
        headline="Test Headline"
        secondaryAction={{ label: 'Click Me', onClick }}
      />
    );
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary action as link when href is provided', () => {
    render(
      <Hero
        headline="Test Headline"
        primaryAction={{ label: 'Link Button', href: '/test' }}
      />
    );
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders secondary action as link when href is provided', () => {
    render(
      <Hero
        headline="Test Headline"
        secondaryAction={{ label: 'Link Button', href: '/about' }}
      />
    );
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
  });

  it('applies background image style when provided', () => {
    const { container } = render(
      <Hero headline="Test" backgroundImage="https://example.com/image.jpg" />
    );
    const hero = container.querySelector('[role="banner"]');
    expect(hero).toHaveStyle({
      backgroundImage: 'url(https://example.com/image.jpg)',
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Hero headline="Test" className="custom-class" />);
    const hero = container.querySelector('[role="banner"]');
    expect(hero).toHaveClass('custom-class');
  });

  it('has banner role for accessibility', () => {
    render(<Hero headline="Test Headline" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Hero headline="Test" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('spreads additional props to hero element', () => {
    render(<Hero headline="Test" data-testid="test-hero" aria-label="Hero section" />);
    const hero = screen.getByTestId('test-hero');
    expect(hero).toHaveAttribute('aria-label', 'Hero section');
  });

  it('applies correct height variant classes', () => {
    const { container } = render(<Hero headline="Test" height="sm" />);
    const hero = container.querySelector('[role="banner"]');
    expect(hero).toHaveClass('min-h-[400px]');
  });

  it('applies correct overlay variant classes', () => {
    const { container } = render(<Hero headline="Test" overlay="dark" />);
    const hero = container.querySelector('[role="banner"]');
    expect(hero?.className).toMatch(/before:bg-background\/70/);
  });

  it('applies correct alignment classes for center', () => {
    const { container } = render(<Hero headline="Test" align="center" />);
    const contentDiv = container.querySelector('.items-center');
    expect(contentDiv).toBeInTheDocument();
  });

  it('applies correct alignment classes for left', () => {
    const { container } = render(<Hero headline="Test" align="left" />);
    const contentDiv = container.querySelector('.items-start');
    expect(contentDiv).toBeInTheDocument();
  });

  it('applies correct alignment classes for right', () => {
    const { container } = render(<Hero headline="Test" align="right" />);
    const contentDiv = container.querySelector('.items-end');
    expect(contentDiv).toBeInTheDocument();
  });

  it('renders without actions', () => {
    render(<Hero headline="Test Headline" subheadline="Test Subheadline" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders with only headline', () => {
    render(<Hero headline="Minimal Hero" />);
    expect(screen.getByRole('heading', { name: /minimal hero/i })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies full-bleed background styles', () => {
    const { container } = render(<Hero headline="Test" />);
    const hero = container.querySelector('[role="banner"]');
    expect(hero).toHaveClass('w-full');
    expect(hero).toHaveClass('bg-cover');
    expect(hero).toHaveClass('bg-center');
  });

  it('renders headline with correct typography classes', () => {
    render(<Hero headline="Test Headline" />);
    const headline = screen.getByRole('heading', { name: /test headline/i });
    expect(headline).toHaveClass('text-ui-h1');
    expect(headline).toHaveClass('font-semibold');
  });

  it('renders subheadline with correct typography classes', () => {
    const { container } = render(
      <Hero headline="Test" subheadline="Test Subheadline" />
    );
    const subheadline = screen.getByText(/test subheadline/i);
    expect(subheadline).toHaveClass('text-ui-body');
    expect(subheadline).toHaveClass('text-muted-foreground');
  });

  it('primary button has large size', () => {
    render(
      <Hero
        headline="Test"
        primaryAction={{ label: 'Primary', onClick: jest.fn() }}
      />
    );
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('h-ui-control-lg');
  });

  it('secondary button has outline variant', () => {
    render(
      <Hero
        headline="Test"
        secondaryAction={{ label: 'Secondary', onClick: jest.fn() }}
      />
    );
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-input');
  });
});

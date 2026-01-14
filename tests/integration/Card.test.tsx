import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/card';

describe('Card Component', () => {
  describe('rendering', () => {
    it('renders Card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      const card = container.querySelector('.custom-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('applies correct base styles to Card', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('rounded-lg');
      expect(card.className).toContain('border');
      expect(card.className).toContain('bg-card');
    });

    it('applies correct styles to CardHeader', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header');
      
      expect(header.className).toContain('flex');
      expect(header.className).toContain('flex-col');
      expect(header.className).toContain('space-y-1.5');
    });

    it('applies correct styles to CardTitle', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );
      const title = screen.getByText('Title');
      
      expect(title.className).toContain('font-semibold');
      expect(title.className).toContain('leading-none');
    });

    it('applies correct styles to CardDescription', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );
      const description = screen.getByText('Description');
      
      expect(description.className).toContain('text-sm');
      expect(description.className).toContain('text-muted-foreground');
    });
  });

  describe('composition', () => {
    it('allows partial composition (header only)', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
    });

    it('allows partial composition (content only)', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      );

      expect(screen.getByText('Content Only')).toBeInTheDocument();
    });

    it('allows custom content between sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <div>Custom content</div>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses semantic HTML elements', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('token compliance', () => {
    it('uses semantic color tokens', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('bg-card');
      expect(card.className).toContain('text-card-foreground');
    });

    it('uses spacing tokens', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header');
      
      expect(header.className).toMatch(/p-\d+/);
      expect(header.className).not.toMatch(/\[\d+px\]/);
    });
  });
});

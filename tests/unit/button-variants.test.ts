import { buttonVariants } from '@/components/button';

describe('buttonVariants', () => {
  describe('variant prop', () => {
    it('generates default variant classes', () => {
      const classes = buttonVariants({ variant: 'default' });
      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
    });

    it('generates secondary variant classes', () => {
      const classes = buttonVariants({ variant: 'secondary' });
      expect(classes).toContain('bg-secondary');
      expect(classes).toContain('text-secondary-foreground');
    });

    it('generates destructive variant classes', () => {
      const classes = buttonVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('text-destructive-foreground');
    });

    it('generates outline variant classes', () => {
      const classes = buttonVariants({ variant: 'outline' });
      expect(classes).toContain('border');
      expect(classes).toContain('bg-background');
    });

    it('generates ghost variant classes', () => {
      const classes = buttonVariants({ variant: 'ghost' });
      expect(classes).toContain('hover:bg-accent');
    });

    it('generates link variant classes', () => {
      const classes = buttonVariants({ variant: 'link' });
      expect(classes).toContain('underline-offset-4');
    });
  });

  describe('size prop', () => {
    it('generates default size classes', () => {
      const classes = buttonVariants({ size: 'default' });
      expect(classes).toContain('h-10');
      expect(classes).toContain('px-4');
      expect(classes).toContain('py-2');
    });

    it('generates sm size classes', () => {
      const classes = buttonVariants({ size: 'sm' });
      expect(classes).toContain('h-9');
      expect(classes).toContain('px-3');
    });

    it('generates lg size classes', () => {
      const classes = buttonVariants({ size: 'lg' });
      expect(classes).toContain('h-11');
      expect(classes).toContain('px-8');
    });

    it('generates icon size classes', () => {
      const classes = buttonVariants({ size: 'icon' });
      expect(classes).toContain('h-10');
      expect(classes).toContain('w-10');
    });
  });

  describe('token compliance', () => {
    it('uses semantic color tokens (no hardcoded colors)', () => {
      const allVariants = [
        buttonVariants({ variant: 'default' }),
        buttonVariants({ variant: 'secondary' }),
        buttonVariants({ variant: 'destructive' }),
        buttonVariants({ variant: 'outline' }),
        buttonVariants({ variant: 'ghost' }),
        buttonVariants({ variant: 'link' }),
      ];

      allVariants.forEach((classes) => {
        expect(classes).not.toMatch(/#[0-9a-f]{3,6}/i);
        expect(classes).not.toMatch(/rgb\(/);
        expect(classes).not.toMatch(/rgba\(/);
      });
    });

    it('uses spacing tokens (no arbitrary values)', () => {
      const allSizes = [
        buttonVariants({ size: 'default' }),
        buttonVariants({ size: 'sm' }),
        buttonVariants({ size: 'lg' }),
        buttonVariants({ size: 'icon' }),
      ];

      allSizes.forEach((classes) => {
        expect(classes).not.toMatch(/\[\d+px\]/);
        expect(classes).not.toMatch(/\[\d+rem\]/);
      });
    });
  });
});

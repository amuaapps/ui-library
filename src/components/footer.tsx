import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  copyrightText?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, logo, copyrightText = '© Amua Apps 2026', links, ...props }, ref) => {
    const defaultLinks = [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Contact', href: '#' },
    ];

    const footerLinks = links || defaultLinks;

    return (
      <footer
        ref={ref}
        className={cn('w-full border-t bg-muted dark:bg-background', className)}
        {...props}
      >
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Logo - centered on all viewports */}
          <div className="flex justify-center mb-6">
            {logo || (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-foreground text-background text-ui-label font-medium">
                L
              </div>
            )}
          </div>

          {/* Links and Copyright - stacked on mobile, side-by-side on larger screens */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            {/* Links */}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {footerLinks.map((link, index) => (
                <Button key={index} variant="link" asChild>
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-ui-small text-center sm:text-right text-muted-foreground">
              {copyrightText}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export { Footer };

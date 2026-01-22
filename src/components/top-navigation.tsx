import * as React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TopNavigationProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
}

const TopNavigation = React.forwardRef<HTMLElement, TopNavigationProps>(
  ({ className, logo, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'shadow-ui-sm',
          className
        )}
        {...props}
      >
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {logo || (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-ui-label font-medium">
                L
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>
    );
  }
);

TopNavigation.displayName = 'TopNavigation';

export { TopNavigation };

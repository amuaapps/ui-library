import * as React from 'react';
import { cn } from '../lib/utils';

interface AccordionBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionBox = React.forwardRef<HTMLDivElement, AccordionBoxProps>(
  ({ title, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-prose mx-auto px-4 sm:px-0',
          'bg-card text-card-foreground border border-border rounded-lg',
          'p-4 sm:p-6',
          className
        )}
      >
        <h2 className="text-ui-h2 font-semibold mb-6">{title}</h2>
        {children}
      </div>
    );
  }
);

AccordionBox.displayName = 'AccordionBox';

export { AccordionBox };

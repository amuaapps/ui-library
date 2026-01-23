import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, X } from 'lucide-react';

export interface DialogBoxItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

interface DialogBoxProps {
  title: string;
  items: DialogBoxItem[];
  className?: string;
}

const DialogBox = React.forwardRef<HTMLDivElement, DialogBoxProps>(
  ({ title, items, className }, ref) => {
    const [openItemId, setOpenItemId] = React.useState<string | null>(null);

    const openItem = items.find((item) => item.id === openItemId);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-prose mx-auto px-4 sm:px-0',
          'bg-card text-card-foreground border border-border rounded-lg',
          'p-4 sm:p-6',
          'relative overflow-hidden',
          className
        )}
      >
        <h2 className="text-ui-h2 font-semibold mb-6">{title}</h2>
        
        {/* List view */}
        <div
          className={cn(
            'space-y-3 transition-all duration-200',
            openItemId && 'opacity-0 pointer-events-none absolute'
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setOpenItemId(item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-4',
                'bg-muted hover:bg-muted/80 rounded-lg',
                'transition-colors',
                'text-left'
              )}
            >
              {item.icon && (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {item.icon}
                </div>
              )}
              <span className="flex-1 font-medium">{item.title}</span>
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Expanded view */}
        {openItem && (
          <div
            className={cn(
              'animate-in fade-in-0 slide-in-from-top-2 duration-200'
            )}
          >
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-4">
              {openItem.icon && (
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {openItem.icon}
                </div>
              )}
              <span className="flex-1 font-medium">{openItem.title}</span>
              <button
                onClick={() => setOpenItemId(null)}
                className="flex-shrink-0 p-1 hover:bg-muted-foreground/10 rounded transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div>{openItem.content}</div>
          </div>
        )}
      </div>
    );
  }
);

DialogBox.displayName = 'DialogBox';

export { DialogBox };

import * as React from 'react';
import { cn } from '../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { ChevronDown, X } from 'lucide-react';

export interface CollapsibleBoxItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

interface CollapsibleBoxProps {
  title: string;
  items: CollapsibleBoxItem[];
  className?: string;
}

const CollapsibleBox = React.forwardRef<HTMLDivElement, CollapsibleBoxProps>(
  ({ title, items, className }, ref) => {
    const [openItemId, setOpenItemId] = React.useState<string | null>(null);
    const [contentHeight, setContentHeight] = React.useState<number | null>(null);
    const contentRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

    React.useEffect(() => {
      const heights = Array.from(contentRefs.current.values()).map(
        (el) => el.scrollHeight
      );
      const maxHeight = Math.max(...heights, 0);
      if (maxHeight > 0) {
        setContentHeight(maxHeight);
      }
    }, [items]);

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
        <div
          className="space-y-3"
          style={contentHeight ? { minHeight: `${contentHeight + 200}px` } : undefined}
        >
          {items.map((item) => {
            const isOpen = openItemId === item.id;
            const isAnyOpen = openItemId !== null;

            if (isAnyOpen && !isOpen) {
              return null;
            }

            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={(open) => setOpenItemId(open ? item.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <button
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
                    {isOpen ? (
                      <X className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 duration-200">
                  <div ref={(el) => el && contentRefs.current.set(item.id, el)}>
                    {item.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Hidden measurement elements */}
        <div className="sr-only" aria-hidden="true">
          {items.map((item) => (
            <div
              key={`measure-${item.id}`}
              ref={(el) => el && contentRefs.current.set(item.id, el)}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CollapsibleBox.displayName = 'CollapsibleBox';

export { CollapsibleBox };

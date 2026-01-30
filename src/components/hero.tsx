import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { Button } from './button';

const heroVariants = cva(
  'relative w-full overflow-hidden bg-cover bg-center bg-no-repeat',
  {
    variants: {
      height: {
        sm: 'min-h-[400px]',
        md: 'min-h-[500px]',
        lg: 'min-h-[600px]',
        xl: 'min-h-[700px]',
        full: 'min-h-screen',
      },
      overlay: {
        none: '',
        light: 'before:absolute before:inset-0 before:bg-background/30 before:z-0',
        medium: 'before:absolute before:inset-0 before:bg-background/50 before:z-0',
        dark: 'before:absolute before:inset-0 before:bg-background/70 before:z-0',
        gradient:
          'before:absolute before:inset-0 before:bg-gradient-to-t before:from-background before:to-transparent before:z-0',
      },
      align: {
        left: '',
        center: '',
        right: '',
      },
    },
    defaultVariants: {
      height: 'lg',
      overlay: 'medium',
      align: 'center',
    },
  }
);

const heroContentVariants = cva('relative z-10 flex flex-col gap-6 px-4 sm:px-6 lg:px-8', {
  variants: {
    align: {
      left: 'items-start text-left max-w-2xl',
      center: 'items-center text-center max-w-3xl mx-auto',
      right: 'items-end text-right max-w-2xl ml-auto',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

export interface HeroProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroVariants> {
  backgroundImage?: string;
  headline: string;
  subheadline?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      height,
      overlay,
      align,
      backgroundImage,
      headline,
      subheadline,
      primaryAction,
      secondaryAction,
      style,
      ...props
    },
    ref
  ) => {
    const backgroundStyle = backgroundImage
      ? { backgroundImage: `url(${backgroundImage})`, ...style }
      : style;

    return (
      <div
        ref={ref}
        className={cn(heroVariants({ height, overlay, align, className }))}
        style={backgroundStyle}
        role="banner"
        {...props}
      >
        <div className="container relative z-10 flex h-full min-h-[inherit] items-center py-12 sm:py-16 lg:py-20">
          <div className={cn(heroContentVariants({ align }))}>
            <h1 className="text-ui-h1 font-semibold leading-ui-leading-h1 text-foreground">
              {headline}
            </h1>

            {subheadline && (
              <p className="text-ui-body text-muted-foreground leading-ui-leading-body max-w-2xl">
                {subheadline}
              </p>
            )}

            {(primaryAction || secondaryAction) && (
              <div className="flex flex-wrap gap-4">
                {primaryAction && (
                  <Button
                    size="lg"
                    onClick={primaryAction.onClick}
                    asChild={!!primaryAction.href}
                  >
                    {primaryAction.href ? (
                      <a href={primaryAction.href}>{primaryAction.label}</a>
                    ) : (
                      primaryAction.label
                    )}
                  </Button>
                )}

                {secondaryAction && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    asChild={!!secondaryAction.href}
                  >
                    {secondaryAction.href ? (
                      <a href={secondaryAction.href}>{secondaryAction.label}</a>
                    ) : (
                      secondaryAction.label
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Hero.displayName = 'Hero';

export { Hero, heroVariants };

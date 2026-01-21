import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-ui-body',
        'text-ui-body-sm',
        'text-ui-label',
        'text-ui-button',
        'text-ui-caption',
        'text-ui-h1',
        'text-ui-h2',
        'text-ui-h3',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

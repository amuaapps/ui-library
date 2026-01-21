import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--ui-font-sans)'],
        mono: ['var(--ui-font-mono)'],
      },
      fontSize: {
        'ui-body': ['var(--ui-text-body)', { lineHeight: 'var(--ui-leading-body)' }],
        'ui-body-sm': ['var(--ui-text-body-sm)', { lineHeight: 'var(--ui-leading-body-sm)' }],
        'ui-label': ['var(--ui-text-label)', { lineHeight: 'var(--ui-leading-label)' }],
        'ui-button': ['var(--ui-text-button)', { lineHeight: 'var(--ui-leading-button)' }],
        'ui-caption': ['var(--ui-text-caption)', { lineHeight: 'var(--ui-leading-caption)' }],
        'ui-h1': ['var(--ui-text-h1)', { lineHeight: 'var(--ui-leading-h1)' }],
        'ui-h2': ['var(--ui-text-h2)', { lineHeight: 'var(--ui-leading-h2)' }],
        'ui-h3': ['var(--ui-text-h3)', { lineHeight: 'var(--ui-leading-h3)' }],
      },
      boxShadow: {
        'ui-sm': 'var(--ui-shadow-sm)',
        'ui-md': 'var(--ui-shadow-md)',
        'ui-lg': 'var(--ui-shadow-lg)',
      },
      height: {
        'ui-control-sm': 'var(--ui-control-h-sm)',
        'ui-control-md': 'var(--ui-control-h-md)',
        'ui-control-lg': 'var(--ui-control-h-lg)',
      },
      spacing: {
        'ui-control-px-sm': 'var(--ui-control-px-sm)',
        'ui-control-px-md': 'var(--ui-control-px-md)',
        'ui-control-px-lg': 'var(--ui-control-px-lg)',
        'ui-control-py-sm': 'var(--ui-control-py-sm)',
        'ui-control-py-md': 'var(--ui-control-py-md)',
        'ui-control-py-lg': 'var(--ui-control-py-lg)',
      },
      size: {
        'ui-control-icon': 'var(--ui-control-icon)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

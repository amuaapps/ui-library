import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  async viteFinal(config) {
    // Import PostCSS plugins dynamically
    const tailwindcss = (await import('tailwindcss')).default;
    const autoprefixer = (await import('autoprefixer')).default;
    
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [
            tailwindcss(),
            autoprefixer(),
          ],
        },
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src'),
        },
      },
    });
  },
};

export default config;
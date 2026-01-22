import type { Preview } from '@storybook/react';
import type { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import '../src/styles/index.css';
import '@amuaapps/ui-theme-core/theme.css';
import '@amuaapps/ui-theme-secondary/theme.css';

// Theme decorator to apply theme variant and light/dark mode
const withTheme: Decorator = (Story, context) => {
  const colorMode = context.globals.colorMode || 'light';
  const themeVariant = context.globals.themeVariant || 'core';

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-core', 'theme-secondary');
    
    // Apply theme variant and color mode
    root.classList.add(`theme-${themeVariant}`, colorMode);
    
    // Apply to body as well
    document.body.className = `theme-${themeVariant} ${colorMode}`;
  }, [colorMode, themeVariant]);

  return (
    <div className="bg-background text-foreground min-h-screen p-4">
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
    },
    layout: 'centered',
  },
  decorators: [withTheme],
  globalTypes: {
    colorMode: {
      description: 'Color mode (light/dark)',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    themeVariant: {
      description: 'Theme variant',
      defaultValue: 'core',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'core', title: 'Core Theme' },
          { value: 'secondary', title: 'Secondary Theme' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;

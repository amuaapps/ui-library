import type { Preview } from '@storybook/react';
import type { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import '../src/styles/index.css';
import '@amuaapps/ui-theme-core/theme.css';

// Theme decorator to apply dark class based on global theme
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('theme-core', theme);
    
    // Apply background and text color to body
    document.body.className = `theme-core ${theme}`;
  }, [theme]);

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
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;

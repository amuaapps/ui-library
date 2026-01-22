import type { Meta, StoryObj } from '@storybook/react';
import { TopNavigation } from './top-navigation';

const meta = {
  title: 'Composite Components/TopNavigation',
  component: TopNavigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TopNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <TopNavigation />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Page Content</h1>
        <p className="text-ui-body text-muted-foreground">
          The top navigation is sticky and will remain at the top of the page as you scroll.
        </p>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-ui-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <div>
      <TopNavigation
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
            <span className="text-ui-label font-semibold">Brand Name</span>
          </div>
        }
      />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Custom Logo Example</h1>
        <p className="text-ui-body text-muted-foreground">
          You can pass a custom logo component to replace the default placeholder.
        </p>
      </div>
    </div>
  ),
};

export const WithImageLogo: Story = {
  render: () => (
    <div>
      <TopNavigation
        logo={
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-ui-label font-semibold hidden sm:inline-block">
              Company
            </span>
          </div>
        }
      />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Logo with Icon</h1>
        <p className="text-ui-body text-muted-foreground">
          Example with an icon-based logo and responsive text.
        </p>
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Dark Mode</h1>
        <p className="text-ui-body text-muted-foreground">
          The top navigation adapts to dark mode with appropriate colors and contrast.
        </p>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} className="text-ui-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const DarkModeWithCustomLogo: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
            <span className="text-ui-label font-semibold">Brand Name</span>
          </div>
        }
      />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Dark Mode with Custom Logo</h1>
        <p className="text-ui-body text-muted-foreground">
          Custom logo in dark mode with gradient and brand name.
        </p>
      </div>
    </div>
  ),
};

export const DarkModeWithImageLogo: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation
        logo={
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-ui-label font-semibold hidden sm:inline-block">
              Company
            </span>
          </div>
        }
      />
      <div className="p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Dark Mode with Icon Logo</h1>
        <p className="text-ui-body text-muted-foreground">
          Icon-based logo with responsive text in dark mode.
        </p>
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './footer';

const meta = {
  title: 'Composite Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Page Content</h1>
        <p className="text-ui-body text-muted-foreground">
          The footer appears at the bottom with a dark background (inverted in dark mode).
        </p>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-ui-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  ),
};

export const WithCustomLogo: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Custom Logo Example</h1>
        <p className="text-ui-body text-muted-foreground">Footer with a custom logo component.</p>
      </div>
      <Footer
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
            <span className="text-ui-label font-semibold">Brand Name</span>
          </div>
        }
      />
    </div>
  ),
};

export const WithCustomLinks: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Custom Links Example</h1>
        <p className="text-ui-body text-muted-foreground">Footer with custom navigation links.</p>
      </div>
      <Footer
        links={[
          { label: 'About', href: '#about' },
          { label: 'Blog', href: '#blog' },
          { label: 'Careers', href: '#careers' },
          { label: 'Support', href: '#support' },
        ]}
      />
    </div>
  ),
};

export const WithCustomCopyright: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Custom Copyright Text</h1>
        <p className="text-ui-body text-muted-foreground">Footer with custom copyright text.</p>
      </div>
      <Footer copyrightText="© 2026 Your Company. All rights reserved." />
    </div>
  ),
};

export const FullyCustomized: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Fully Customized Footer</h1>
        <p className="text-ui-body text-muted-foreground">
          Footer with custom logo, links, and copyright text.
        </p>
      </div>
      <Footer
        logo={
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-background/10 dark:bg-foreground/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-ui-label font-semibold">Company</span>
          </div>
        }
        links={[
          { label: 'About Us', href: '#about' },
          { label: 'Products', href: '#products' },
          { label: 'Blog', href: '#blog' },
          { label: 'Contact', href: '#contact' },
          { label: 'Privacy Policy', href: '#privacy' },
        ]}
        copyrightText="© 2026 Company Name. All rights reserved."
      />
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Dark Mode</h1>
        <p className="text-ui-body text-muted-foreground">
          The footer inverts its colors in dark mode - light background with dark text.
        </p>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-ui-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  ),
};

export const DarkModeCustomized: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 p-8">
        <h1 className="text-ui-h1 font-semibold mb-4">Dark Mode - Customized</h1>
        <p className="text-ui-body text-muted-foreground">Fully customized footer in dark mode.</p>
      </div>
      <Footer
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
            <span className="text-ui-label font-semibold">Brand Name</span>
          </div>
        }
        links={[
          { label: 'About', href: '#about' },
          { label: 'Blog', href: '#blog' },
          { label: 'Careers', href: '#careers' },
          { label: 'Support', href: '#support' },
        ]}
        copyrightText="© 2026 Your Company. All rights reserved."
      />
    </div>
  ),
};

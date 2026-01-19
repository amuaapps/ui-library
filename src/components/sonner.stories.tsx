import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';
import { Button } from './button';
import { SonnerToaster } from './sonner';

const meta = {
  title: 'Components/Sonner',
  component: SonnerToaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SonnerToaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        Show Toast
      </Button>
      <SonnerToaster />
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div>
      <Button variant="outline" onClick={() => toast.success('Event has been created')}>
        Show Success Toast
      </Button>
      <SonnerToaster />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div>
      <Button variant="outline" onClick={() => toast.error('Event has not been created')}>
        Show Error Toast
      </Button>
      <SonnerToaster />
    </div>
  ),
};

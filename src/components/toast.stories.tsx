import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Toaster } from './toaster';
import { useToast } from './use-toast';

const meta = {
  title: 'Components/Toast',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up ',
            description: 'Friday, February 10, 2023 at 5:57 PM',
          });
        }}
      >
        Add to calendar
      </Button>
      <Toaster />
    </div>
  );
}

export const Default: Story = {
  render: () => <ToastDemo />,
};

function ToastWithAction() {
  const { toast } = useToast();

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
            action: <Button variant="outline">Try again</Button>,
          });
        }}
      >
        Show Toast
      </Button>
      <Toaster />
    </div>
  );
}

export const WithAction: Story = {
  render: () => <ToastWithAction />,
};

function DestructiveToast() {
  const { toast } = useToast();

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request.',
          });
        }}
      >
        Show Toast
      </Button>
      <Toaster />
    </div>
  );
}

export const Destructive: Story = {
  render: () => <DestructiveToast />,
};

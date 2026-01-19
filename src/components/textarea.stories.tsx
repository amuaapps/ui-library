import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from './label';
import { Button } from './button';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};

export const WithText: Story = {
  args: {
    defaultValue: 'This is some default text in the textarea.',
  },
};

export const WithButton: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="message-2">Your Message</Label>
      <Textarea id="message-2" placeholder="Type your message here." />
      <Button className="w-full">Send message</Button>
    </div>
  ),
};

export const LongForm: Story = {
  render: () => (
    <div className="w-[450px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Tell us about yourself" className="min-h-[100px]" />
        <p className="text-sm text-muted-foreground">
          You can @mention other users and organizations.
        </p>
      </div>
      <Button>Save</Button>
    </div>
  ),
};

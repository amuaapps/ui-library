import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
  },
};

export const Password: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter password" />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="email" placeholder="Email" />
      <Button type="submit">Subscribe</Button>
    </div>
  ),
};

export const File: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="file">Upload File</Label>
      <Input id="file" type="file" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text</Label>
        <Input id="text" type="text" placeholder="Text input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-type">Email</Label>
        <Input id="email-type" type="email" placeholder="Email input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number">Number</Label>
        <Input id="number" type="number" placeholder="Number input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tel">Telephone</Label>
        <Input id="tel" type="tel" placeholder="Phone number" />
      </div>
    </div>
  ),
};

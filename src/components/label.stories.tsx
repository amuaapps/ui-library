import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';
import { Checkbox } from './checkbox';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="input-example">Your Name</Label>
      <Input id="input-example" placeholder="Enter your name" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms-label" />
      <Label htmlFor="terms-label">Accept terms and conditions</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="required-input">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input id="required-input" type="email" placeholder="you@example.com" required />
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-form">Email</Label>
        <Input id="email-form" type="email" placeholder="john.doe@example.com" />
      </div>
    </div>
  ),
};

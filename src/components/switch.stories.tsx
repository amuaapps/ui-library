import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';
import { Label } from './label';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    checked: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Switch />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-switch" disabled />
      <Label htmlFor="disabled-switch" className="text-muted-foreground">
        Disabled
      </Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-checked" disabled checked />
      <Label htmlFor="disabled-checked" className="text-muted-foreground">
        Disabled & Checked
      </Label>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing" className="flex flex-col space-y-1">
          <span>Marketing emails</span>
          <span className="font-normal text-sm text-muted-foreground">
            Receive emails about new products and features.
          </span>
        </Label>
        <Switch id="marketing" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="security" className="flex flex-col space-y-1">
          <span>Security emails</span>
          <span className="font-normal text-sm text-muted-foreground">
            Receive emails about your account security.
          </span>
        </Label>
        <Switch id="security" defaultChecked />
      </div>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Toggle',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Toggle',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const WithIcon: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <span className="font-bold">B</span>
    </Toggle>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Toggle aria-label="Toggle bold">
        <span className="font-bold">B</span>
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <span className="italic">I</span>
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <span className="underline">U</span>
      </Toggle>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Toggle variant="default">Default</Toggle>
        <Toggle variant="outline">Outline</Toggle>
      </div>
      <div className="flex gap-2 items-center">
        <Toggle size="sm">Small</Toggle>
        <Toggle size="default">Default</Toggle>
        <Toggle size="lg">Large</Toggle>
      </div>
    </div>
  ),
};

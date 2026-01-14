import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const WithRange: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
};

export const CustomStep: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Step: 10</p>
        <Slider defaultValue={[50]} max={100} step={10} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Step: 25</p>
        <Slider defaultValue={[50]} max={100} step={25} />
      </div>
    </div>
  ),
};

export const CustomRange: Story = {
  render: () => (
    <div className="w-[300px]">
      <p className="text-sm text-muted-foreground mb-2">Range: 0-200</p>
      <Slider defaultValue={[100]} min={0} max={200} step={1} />
    </div>
  ),
};

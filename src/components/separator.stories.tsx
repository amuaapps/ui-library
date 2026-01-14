import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center space-x-4">
      <div className="text-sm">Item 1</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Item 2</div>
      <Separator orientation="vertical" />
      <div className="text-sm">Item 3</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="p-2">Item 1</div>
      <Separator />
      <div className="p-2">Item 2</div>
      <Separator />
      <div className="p-2">Item 3</div>
      <Separator />
      <div className="p-2">Item 4</div>
    </div>
  ),
};

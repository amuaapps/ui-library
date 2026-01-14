import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Button } from './button';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover (500ms delay)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This tooltip has a 500ms delay</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <span className="text-lg">?</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Help & Support</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const LongContent: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover for details</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            This is a longer tooltip with more detailed information about the feature or action.
            It can span multiple lines.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Multiple: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Save</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save your changes</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Delete</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete this item</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Share</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share with others</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

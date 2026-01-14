import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './aspect-ratio';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full items-center justify-center rounded-md bg-muted">
          <span className="text-muted-foreground">16:9 Aspect Ratio</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1}>
        <div className="flex h-full items-center justify-center rounded-md bg-muted">
          <span className="text-muted-foreground">1:1 Square</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={3 / 4}>
        <div className="flex h-full items-center justify-center rounded-md bg-muted">
          <span className="text-muted-foreground">3:4 Portrait</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9}>
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="h-full w-full rounded-md object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

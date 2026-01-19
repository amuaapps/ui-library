import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Combobox } from './combobox';

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt.js', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
];

export const Default: Story = {
  args: {
    options: frameworks,
    placeholder: 'Select framework...',
    searchPlaceholder: 'Search framework...',
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return <Combobox {...args} value={value} onValueChange={setValue} />;
  },
};

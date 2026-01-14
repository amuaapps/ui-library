import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="r2" disabled />
        <Label htmlFor="r2" className="text-muted-foreground">
          Disabled
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-three" id="r3" />
        <Label htmlFor="r3">Another Option</Label>
      </div>
    </RadioGroup>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="mb-4 text-sm font-medium">Notify me about...</h3>
        <RadioGroup defaultValue="all">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="r-all" />
            <Label htmlFor="r-all">All new messages</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mentions" id="r-mentions" />
            <Label htmlFor="r-mentions">Direct messages and mentions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="r-none" />
            <Label htmlFor="r-none">Nothing</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};

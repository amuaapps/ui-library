import type { Meta, StoryObj } from "@storybook/react";
import { Chart } from "./chart";

const meta = {
  title: "Components/Chart",
  component: Chart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

export const Default: Story = {
  args: {
    data,
    dataKey: "value",
    xAxisKey: "name",
  },
};

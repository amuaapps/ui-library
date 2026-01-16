import * as React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { cn } from "../lib/utils";

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
}

export function Chart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height = 350,
  className,
  ...props
}: ChartProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="hsl(var(--primary))" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

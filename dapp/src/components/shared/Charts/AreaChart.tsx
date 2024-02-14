import React from "react"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { AreaChartType } from "#/types"
import { AreaChartTooltip } from "./AreaChartTooltip"

const baseColor = "#F34900"

export function AreaChart({ data }: { data: AreaChartType[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        width={300}
        height={100}
        data={data}
        margin={{
          top: 10,
          left: 30,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={baseColor} stopOpacity={0.8} />
            <stop offset="95%" stopColor={baseColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          opacity={0.5}
          strokeDasharray="0"
          verticalCoordinatesGenerator={() => []}
        />
        <XAxis
          dataKey="xAxis"
          axisLine={false}
          style={{
            fontSize: "0.8rem",
            fontWeight: "semibold",
            color: "#675E60",
          }}
        />
        <YAxis
          ticks={[0, 1, 2, 3, 4, 5, 6]}
          tickCount={7}
          tickFormatter={(tick) => `${tick}.00%`}
          dataKey="yAxis"
          orientation="right"
          axisLine={false}
          style={{
            fontSize: "0.8rem",
            fontWeight: "semibold",
            color: "#675E60",
          }}
        />
        <Tooltip content={<AreaChartTooltip />} />
        <Area
          dataKey="yAxis"
          type="linear"
          stroke={baseColor}
          strokeWidth={3}
          fill="url(#colorUv)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

import React from "react"
import { Box } from "@chakra-ui/react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { mockedStats } from "./mocked-stats"
import { ChartTooltip } from "./chartTooltip"

export function PoolStats() {
  return (
    <Box position="absolute" top={20} bottom={0} left={0} right={0}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={300}
          height={100}
          data={mockedStats}
          margin={{
            top: 10,
            left: 30,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F34900" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F34900" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            opacity={0.5}
            strokeDasharray="0"
            verticalCoordinatesGenerator={() => []}
          />
          <XAxis
            dataKey="month"
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
            dataKey="value"
            orientation="right"
            style={{
              fontSize: "0.8rem",
              fontWeight: "semibold",
              color: "#675E60",
            }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            dataKey="value"
            type="linear"
            stroke="#F34900"
            strokeWidth={3}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

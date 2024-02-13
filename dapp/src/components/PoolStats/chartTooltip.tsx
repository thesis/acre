import React from "react"
import { TooltipProps } from "recharts"
import { TextSm, TextMd } from "../shared/Typography"

export function ChartTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { value, year, month } = payload[0].payload
    return (
      <div
        style={{
          color: "#fff",
          backgroundColor: "#231F20",
          borderRadius: "4px",
          padding: "6px 12px",
        }}
      >
        <TextSm>{`${month}, ${year}`}</TextSm>
        <TextMd>{`${value}.00%`}</TextMd>
      </div>
    )
  }

  return null
}

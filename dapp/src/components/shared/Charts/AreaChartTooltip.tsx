import React from "react"
import { TooltipProps } from "recharts"
import { Box } from "@chakra-ui/react"
import { AreaChartType } from "#/types"
import { TextSm, TextMd } from "../Typography"

export function AreaChartTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const { xAxis, yAxis, label } = payload[0].payload as AreaChartType
  return (
    <Box
      color="white"
      backgroundColor="grey.700"
      borderRadius="base"
      py={1.5}
      px={3}
    >
      <TextSm>{`${xAxis}, ${label}`}</TextSm>
      <TextMd>{`${yAxis}.00%`}</TextMd>
    </Box>
  )
}

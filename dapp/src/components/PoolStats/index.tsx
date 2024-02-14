import React from "react"
import { Box } from "@chakra-ui/react"
import { mockedStats } from "./mocked-stats"
import { AreaChart } from "../shared/Charts/AreaChart"

export function PoolStats() {
  return (
    <Box position="absolute" top={20} bottom={0} left={0} right={0}>
      <AreaChart data={mockedStats} />
    </Box>
  )
}

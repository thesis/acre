import React from "react"
import { Box, Progress, ProgressProps, ProgressLabel } from "@chakra-ui/react"

function ProgressBar(props: ProgressProps) {
  const { value, children, ...restProps } = props

  return (
    <Progress value={value} hasStripe {...restProps}>
      <ProgressLabel>
        {children}

        <Box>{value}%</Box>
      </ProgressLabel>
    </Progress>
  )
}

export default ProgressBar

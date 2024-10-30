import React from "react"
import { Progress, ProgressProps, ProgressLabel, Icon } from "@chakra-ui/react"
import { BoltFilled } from "#/assets/icons"

function ProgressBar(props: ProgressProps) {
  const { value = 0, children, ...restProps } = props

  return (
    <Progress value={value} hasStripe {...restProps}>
      <ProgressLabel>{children}</ProgressLabel>

      {value > 2 && (
        <Icon
          position="absolute"
          top="50%"
          left={`${value}%`}
          color="grey.700"
          boxSize={3}
          transform="auto"
          translateX="-100%"
          translateY="-50%"
          as={BoltFilled}
          mx={-1}
        />
      )}
    </Progress>
  )
}

export default ProgressBar

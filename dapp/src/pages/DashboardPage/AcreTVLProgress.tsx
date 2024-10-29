import React from "react"
import { StackProps, VStack } from "@chakra-ui/react"
import { useTVL } from "#/hooks"

type AcreTVLProgressProps = StackProps

export function AcreTVLProgress(props: AcreTVLProgressProps) {
  const totalValueLocked = useTVL()

  return (
    <VStack {...props}>
      <p>AcreTVLProgress</p>
    </VStack>
  )
}

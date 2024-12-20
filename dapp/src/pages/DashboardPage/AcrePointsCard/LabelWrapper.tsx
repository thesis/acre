import React, { ReactNode } from "react"
import { VStack } from "@chakra-ui/react"

export default function LabelWrapper({ children }: { children: ReactNode }) {
  return (
    <VStack px={4} py={5} spacing={0} rounded="sm" bg="surface.2">
      {children}
    </VStack>
  )
}

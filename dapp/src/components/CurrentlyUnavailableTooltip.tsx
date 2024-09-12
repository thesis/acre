import React, { ReactNode } from "react"
import { Tooltip } from "@chakra-ui/react"

export default function CurrentlyUnavailableTooltip({
  shouldDisplayTooltip,
  children,
}: {
  shouldDisplayTooltip: boolean
  children: ReactNode
}) {
  return shouldDisplayTooltip ? (
    <Tooltip label="Currently unavailable. Please check later.">
      {children}
    </Tooltip>
  ) : (
    children
  )
}

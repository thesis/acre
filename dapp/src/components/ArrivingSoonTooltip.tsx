import React, { ReactNode } from "react"
import { Tooltip } from "@chakra-ui/react"

export default function ArrivingSoonTooltip({
  shouldDisplayTooltip,
  children,
}: {
  shouldDisplayTooltip: boolean
  children: ReactNode
}) {
  return shouldDisplayTooltip ? (
    <Tooltip label="Arriving Soon">{children}</Tooltip>
  ) : (
    children
  )
}

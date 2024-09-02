import React from "react"
import { Info } from "#/assets/icons"
import { Icon, Tooltip, TooltipProps } from "@chakra-ui/react"

export default function InfoTooltip(props: Omit<TooltipProps, "children">) {
  return (
    <Tooltip placement="bottom" {...props}>
      <Icon as={Info} boxSize={4} cursor="pointer" color="grey.400" />
    </Tooltip>
  )
}

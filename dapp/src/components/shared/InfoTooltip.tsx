import React from "react"
import { IconInfoCircleFilled } from "@tabler/icons-react"
import { Icon, TooltipProps } from "@chakra-ui/react"
import Tooltip from "./Tooltip"

// TODO: Define in the new color palette
const ICON_COLOR = "#3A3328"

export default function InfoTooltip(props: Omit<TooltipProps, "children">) {
  return (
    <Tooltip placement="bottom" {...props}>
      <Icon
        as={IconInfoCircleFilled}
        boxSize="1.125rem" // 18px
        cursor="pointer"
        color={ICON_COLOR}
        opacity={0.25}
      />
    </Tooltip>
  )
}

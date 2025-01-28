import React from "react"
import { IconInfoCircleFilled, TablerIcon } from "@tabler/icons-react"
import { Icon, TooltipProps } from "@chakra-ui/react"
import Tooltip from "./Tooltip"

type TooltipIconProps = Omit<TooltipProps, "children"> & {
  icon?: TablerIcon
}

export default function TooltipIcon(props: TooltipIconProps) {
  const { icon, ...restProps } = props
  return (
    <Tooltip placement="bottom" {...restProps}>
      <Icon
        as={icon ?? IconInfoCircleFilled}
        boxSize="1.125rem" // 18px
        cursor="pointer"
        color="brown.30"
      />
    </Tooltip>
  )
}

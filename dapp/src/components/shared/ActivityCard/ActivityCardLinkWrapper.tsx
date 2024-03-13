import React from "react"

import { Link as ReactRouterLink } from "react-router-dom"
import { Link as ChakraLink } from "@chakra-ui/react"
import { ActivityInfo } from "#/types"

type ActivityCardLinkWrapperProps = {
  activity: ActivityInfo
  children: React.ReactNode
}

export function ActivityCardLinkWrapper({
  activity,
  children,
  ...props
}: ActivityCardLinkWrapperProps) {
  return (
    <ChakraLink
      as={ReactRouterLink}
      to="/activity-details"
      state={{ activity }}
      key={activity.txHash}
      {...props}
    >
      {children}
    </ChakraLink>
  )
}

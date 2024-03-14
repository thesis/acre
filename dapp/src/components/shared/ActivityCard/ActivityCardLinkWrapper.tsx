import React from "react"
import { Link as ReactRouterLink } from "react-router-dom"
import { Link as ChakraLink } from "@chakra-ui/react"

type ActivityCardLinkWrapperProps = {
  activityId: string
  children: React.ReactNode
}

export function ActivityCardLinkWrapper({
  activityId,
  children,
  ...props
}: ActivityCardLinkWrapperProps) {
  return (
    <ChakraLink
      as={ReactRouterLink}
      to={`/activity-details/${activityId}`}
      key={activityId}
      {...props}
    >
      {children}
    </ChakraLink>
  )
}

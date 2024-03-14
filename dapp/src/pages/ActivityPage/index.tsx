import React, { useEffect } from "react"
import { Flex, Link as ChakraLink, Icon } from "@chakra-ui/react"

import { Link as ReactRouterLink, useParams } from "react-router-dom"
import { useSidebar } from "#/hooks"
import { ArrowLeft } from "#/assets/icons"
import { mockedActivities } from "#/mock/mock-activities"
import ActivityDetails from "./ActivityDetails"
import { ActivityBar } from "./ActivityBar"

export default function ActivityPage() {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()
  const params = useParams()

  const selectedActivity = mockedActivities.find(
    (_activity) => _activity.txHash === params.activityId,
  )

  useEffect(() => {
    openSideBar()
    return () => closeSidebar()
  }, [closeSidebar, openSideBar])

  return (
    <Flex direction="column" gap={4} p={6}>
      <ChakraLink as={ReactRouterLink} to="/">
        <Icon
          as={ArrowLeft}
          boxSize={8}
          padding={2}
          borderRadius={16}
          color="grey.700"
          bg="opacity.white.5"
          _hover={{ color: "white", bg: "brand.400" }}
        />
      </ChakraLink>
      {selectedActivity && (
        <Flex gap={10}>
          {}
          <ActivityBar activity={selectedActivity} />
          <ActivityDetails activity={selectedActivity} />
        </Flex>
      )}
    </Flex>
  )
}

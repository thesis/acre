import React, { useEffect } from "react"
import { Flex, Link as ChakraLink, Icon } from "@chakra-ui/react"

import { Link as ReactRouterLink } from "react-router-dom"
import { useSidebar } from "#/hooks"
import { routerPath } from "#/router/path"
import { ArrowLeft } from "#/assets/icons"
import ActivityDetails from "./ActivityDetails"
import { ActivityBar } from "./ActivityBar"

export default function ActivityPage() {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  useEffect(() => {
    openSideBar()
    return () => closeSidebar()
  }, [closeSidebar, openSideBar])

  return (
    <Flex direction="column" gap={4} p={6}>
      <ChakraLink as={ReactRouterLink} to={routerPath.dashboard}>
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
      <Flex gap={10}>
        <ActivityBar />
        <ActivityDetails />
      </Flex>
    </Flex>
  )
}

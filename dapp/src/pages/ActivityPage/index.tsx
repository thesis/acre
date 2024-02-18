import React, { useEffect } from "react"
import { Flex, Link as ChakraLink, Icon, VStack } from "@chakra-ui/react"

import { Link as ReactRouterLink } from "react-router-dom"
import { useSidebar } from "#/hooks"
import { ArrowLeft } from "#/assets/icons"
import ActivityBar from "#/components/shared/ActivityBar"
import ActivityDetails from "./ActivityDetails"

export default function ActivityPage() {
  const { onOpen: openSideBar, onClose: closeSidebar } = useSidebar()

  useEffect(() => {
    openSideBar()
    return () => closeSidebar()
  }, [closeSidebar, openSideBar])

  return (
    <Flex direction="column" gap={2} p={6}>
      <VStack alignItems="start" spacing={5}>
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
        <Flex gap={10}>
          <ActivityBar flexDirection="column" />
          <ActivityDetails />
        </Flex>
      </VStack>
    </Flex>
  )
}

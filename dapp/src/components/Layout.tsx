import React from "react"
import { Outlet } from "react-router-dom"
import { Flex, VStack } from "@chakra-ui/react"
import { useIsEmbed, useMobileMode, usePostHogPageViewCapture } from "#/hooks"
import { DappMode } from "#/types"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import MobileModeBanner from "./MobileModeBanner"
import Footer from "./Footer"

// The padding update should also be done in the Header component and Footer theme as well
const PADDING = {
  base: 4,
  md: "2.5rem", // 40px
}
const PAGE_MAX_WIDTH: Record<DappMode, string> = {
  standalone: "63rem", // 1008px
  "ledger-live": "63rem", // 1008px
}

function Layout() {
  const isMobileMode = useMobileMode()
  const { isEmbed, embeddedApp } = useIsEmbed()

  // It needs to be called here because the scope of `RouterProvider` is
  // required to get `location` from `useLocation` hook.
  usePostHogPageViewCapture()

  if (!isEmbed && isMobileMode) return <MobileModeBanner forceOpen />

  const maxWidth = embeddedApp
    ? PAGE_MAX_WIDTH[embeddedApp]
    : PAGE_MAX_WIDTH.standalone

  return (
    <VStack spacing={0} minH="100vh">
      <Header />

      <Flex
        flexFlow="column"
        mx="auto"
        px={PADDING}
        pb={10}
        pt={0.5}
        w="full"
        maxWidth={`calc(${maxWidth} + 2*${PADDING.md})`}
        flex={1}
      >
        <Outlet />

        <ModalRoot />
      </Flex>

      <Footer />
    </VStack>
  )
}

export default Layout

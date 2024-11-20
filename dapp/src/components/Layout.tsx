import React from "react"
import { Outlet } from "react-router-dom"
import { Flex, VStack } from "@chakra-ui/react"
import { useIsEmbed, useMobileMode } from "#/hooks"
import { DappMode } from "#/types"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"
import MobileModeBanner from "./MobileModeBanner"
import Footer from "./Footer"

const PADDING = "2.5rem" // 40px
const PAGE_MAX_WIDTH: Record<DappMode, string> = {
  standalone: "63rem", // 1008px
  "ledger-live": "63rem", // 1008px
}

function Layout() {
  const isMobileMode = useMobileMode()
  const { isEmbed, embeddedApp } = useIsEmbed()

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
        p={PADDING}
        pt={0.5}
        w="full"
        maxWidth={`calc(${maxWidth} + 2*${PADDING})`}
        flex={1}
      >
        <Outlet />

        <Sidebar />
        <DocsDrawer />
        <ModalRoot />
      </Flex>

      <Footer />
    </VStack>
  )
}

export default Layout

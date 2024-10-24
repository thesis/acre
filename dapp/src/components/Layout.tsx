import React from "react"
import { Outlet } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { useIsEmbed, useMobileMode } from "#/hooks"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"
import MobileModeBanner from "./MobileModeBanner"

const PADDING = "2.5rem" // 40px
const PAGE_MAX_WIDTH = {
  standalone: "63rem", // 1008px
  "ledger-live": "63rem", // 1008px
}

function Layout() {
  const isMobileMode = useMobileMode()
  const { embeddedApp } = useIsEmbed()

  if (isMobileMode) return <MobileModeBanner forceOpen />

  const maxWidth = embeddedApp
    ? PAGE_MAX_WIDTH[embeddedApp]
    : PAGE_MAX_WIDTH.standalone

  return (
    <Flex
      flexFlow="column"
      mx="auto"
      p={PADDING}
      maxWidth={`calc(${maxWidth} + 2*${PADDING})`}
    >
      <Header />
      <Outlet />

      <Sidebar />
      <DocsDrawer />
      <ModalRoot />
    </Flex>
  )
}

export default Layout

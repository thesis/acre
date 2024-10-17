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
  standalone: "90rem", // 1440px
  "ledger-live": "63rem", // 1008px
}

function Layout() {
  const isMobileMode = useMobileMode()
  const { isEmbed } = useIsEmbed()

  if (isMobileMode) return <MobileModeBanner forceOpen />

  const maxWidth = isEmbed
    ? // TODO: Select correct max-width by `embeddedApp`
      PAGE_MAX_WIDTH["ledger-live"]
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

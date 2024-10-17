import React from "react"
import { Outlet } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { useIsEmbed, useMobileMode } from "#/hooks"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"
import MobileModeBanner from "./MobileModeBanner"

const PAGE_MAX_WIDTH = {
  standalone: "110rem", // 1760px
  "ledger-live": "68rem", // 1088px
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
    <Flex flexFlow="column" p={10} mx="auto" maxWidth={maxWidth}>
      <Header />
      <Outlet />

      <Sidebar />
      <DocsDrawer />
      <ModalRoot />
    </Flex>
  )
}

export default Layout

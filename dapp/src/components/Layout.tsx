import React from "react"
import { Outlet } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { useMobileMode } from "#/hooks"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"
import MobileModeBanner from "./MobileModeBanner"

const PAGE_MAX_WIDTH = "110rem" // 1760px -> content width + x-axis padding

function Layout() {
  const isMobileMode = useMobileMode()

  if (isMobileMode) return <MobileModeBanner forceOpen />

  return (
    <Flex flexFlow="column" p={10} mx="auto" maxW={PAGE_MAX_WIDTH}>
      <Header />
      <Outlet />

      <Sidebar />
      <DocsDrawer />
      <ModalRoot />
    </Flex>
  )
}

export default Layout

import React from "react"
import { Outlet } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { useMobileMode } from "#/hooks"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"
import MobileModeBanner from "./MobileModeBanner"

function Layout() {
  const isMobileMode = useMobileMode()

  if (isMobileMode) return <MobileModeBanner forceOpen />

  return (
    <Flex flexFlow="column" p={10}>
      <Header />
      <Outlet />

      <Sidebar />
      <DocsDrawer />
      <ModalRoot />
    </Flex>
  )
}

export default Layout

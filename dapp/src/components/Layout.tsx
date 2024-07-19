import React from "react"
import { Outlet } from "react-router-dom"
import { Flex } from "@chakra-ui/react"
import { useMobileMode } from "#/hooks"
import DocsDrawer from "./DocsDrawer"
import Header from "./Header"
import ModalRoot from "./ModalRoot"
import Sidebar from "./Sidebar"

function Layout() {
  const isMobileMode = useMobileMode()

  return (
    <Flex flexFlow="column">
      <Header />
      <Outlet />

      {!isMobileMode && (
        <>
          <Sidebar />
          <DocsDrawer />
          <ModalRoot />
        </>
      )}
    </Flex>
  )
}

export default Layout

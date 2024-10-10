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
  embed: "68rem", // 1088px
}

function Layout() {
  const isMobileMode = useMobileMode()
  const { isEmbed } = useIsEmbed()

  if (isMobileMode) return <MobileModeBanner forceOpen />

  return (
    <Flex
      flexFlow="column"
      p={10}
      mx="auto"
      maxW={isEmbed ? PAGE_MAX_WIDTH.embed : PAGE_MAX_WIDTH.standalone}
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

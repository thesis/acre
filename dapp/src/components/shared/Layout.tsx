import React from "react"
import { Box, BoxProps } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Header from "../Header"
import DocsDrawer from "../DocsDrawer"
import Sidebar from "../Sidebar"

function Layout(props: BoxProps) {
  return (
    <>
      <Box as="main" {...props}>
        <Header />
        <Outlet />
      </Box>
      <Sidebar />
      <DocsDrawer />
    </>
  )
}

export default Layout

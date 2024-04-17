import React from "react"
import { Box, BoxProps } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Header from "../Header"
import DocsDrawer from "../DocsDrawer"
import Sidebar from "../Sidebar"

function Layout(props: BoxProps) {
  return (
    <>
      <Header />
      <Box as="main" {...props}>
        <Outlet />
      </Box>
      <Sidebar />
      <DocsDrawer />
    </>
  )
}

export default Layout

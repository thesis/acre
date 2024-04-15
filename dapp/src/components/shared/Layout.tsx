import React from "react"
import { Box, BoxProps } from "@chakra-ui/react"
import Header from "../Header"
import DocsDrawer from "../DocsDrawer"
import Sidebar from "../Sidebar"

function Layout(props: BoxProps) {
  const { children, ...restProps } = props
  return (
    <>
      <Box as="main" {...restProps}>
        <Header />
        {children}
      </Box>
      <Sidebar />
      <DocsDrawer />
    </>
  )
}

export default Layout

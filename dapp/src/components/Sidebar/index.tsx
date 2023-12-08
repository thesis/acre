import React from "react"
import { Box, Button, useColorModeValue } from "@chakra-ui/react"
import DocsDrawer from "../DocsDrawer"
import { useDocsDrawer, useSidebar } from "../../hooks"
import { HEADER_HEIGHT } from "../Header"

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { onOpen: openDocsDrawer } = useDocsDrawer()

  return (
    <>
      <Box
        top={0}
        right={0}
        h="100vh"
        position="fixed"
        width={isOpen ? 80 : 0}
        height="100vh"
        transition="width 0.3s"
        zIndex="sidebar"
        // TODO: Set the correct background color
        bg={useColorModeValue("white", "white")}
        mt={HEADER_HEIGHT}
      >
        {/* TODO: Add a correct content for the sidebar */}
        <Button onClick={openDocsDrawer}>Open a documentation</Button>
      </Box>
      <DocsDrawer />
    </>
  )
}

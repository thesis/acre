import React from "react"
import { Box, Button } from "@chakra-ui/react"
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
        w={isOpen ? 80 : 0}
        position="fixed"
        overflow="hidden"
        transition="width 0.3s"
        zIndex="sidebar"
        mt={HEADER_HEIGHT}
      >
        <Box
          p={4}
          h="100%"
          borderTop="2px"
          borderLeft="2px"
          borderColor="white"
          borderTopLeftRadius="xl"
        >
          {/* TODO: Add a correct content for the sidebar */}
          <Button onClick={openDocsDrawer}>Open a documentation</Button>
        </Box>
      </Box>
      <DocsDrawer />
    </>
  )
}

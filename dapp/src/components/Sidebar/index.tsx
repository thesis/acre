import React from "react"
import { Box, Button, useMultiStyleConfig } from "@chakra-ui/react"
import { useDocsDrawer, useSidebar } from "#/hooks"

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { onOpen: openDocsDrawer } = useDocsDrawer()
  const styles = useMultiStyleConfig("Sidebar")

  return (
    <Box
      as="aside"
      mt="header_height"
      w={isOpen ? 80 : 0}
      __css={styles.sidebarContainer}
    >
      <Box __css={styles.sidebar}>
        {/* TODO: Add a correct content for the sidebar */}
        <Button onClick={openDocsDrawer}>Open a documentation</Button>
      </Box>
    </Box>
  )
}

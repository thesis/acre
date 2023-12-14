import React from "react"
import { Box, Button, useMultiStyleConfig } from "@chakra-ui/react"
import DocsDrawer from "../DocsDrawer"
import { useDocsDrawer, useSidebar } from "../../hooks"
import { HEADER_HEIGHT } from "../Header"

export default function Sidebar() {
  const { isOpen } = useSidebar()
  const { onOpen: openDocsDrawer } = useDocsDrawer()
  const styles = useMultiStyleConfig("Sidebar")

  return (
    <>
      <Box
        w={isOpen ? 80 : 0}
        mt={HEADER_HEIGHT}
        __css={styles.sidebarContainer}
      >
        <Box __css={styles.sidebar}>
          {/* TODO: Add a correct content for the sidebar */}
          <Button onClick={openDocsDrawer}>Open a documentation</Button>
        </Box>
      </Box>
      <DocsDrawer />
    </>
  )
}

import React from "react"
import { Box, Button, useColorModeValue } from "@chakra-ui/react"
import { useDocsDrawerContext, useStakingFlowContext } from "../../hooks"
import DocsDrawer from "../DocsDrawer"

export default function Sidebar({ marginTop }: { marginTop?: number }) {
  const { modalType } = useStakingFlowContext()
  const { onOpen } = useDocsDrawerContext()

  return (
    <>
      <Box
        top={0}
        right={0}
        h="100vh"
        position="fixed"
        width={modalType ? 80 : 0}
        height="100vh"
        transition="width 0.3s"
        zIndex="sidebar"
        // TODO: Set the correct background color
        bg={useColorModeValue("white", "white")}
        mt={marginTop}
      >
        {/* TODO: Add a correct content for the sidebar */}
        <Button onClick={onOpen}>Open a documentation</Button>
      </Box>
      <DocsDrawer />
    </>
  )
}

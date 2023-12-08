import React from "react"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useColorModeValue,
} from "@chakra-ui/react"
import { useDocsDrawer } from "../../hooks"
import { TextMd } from "../Typography"
import { HEADER_HEIGHT } from "../Header"

export default function DocsDrawer() {
  const { isOpen, onClose } = useDocsDrawer()

  return (
    <Drawer size="xl" placement="right" isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay
        mt={HEADER_HEIGHT}
        // TODO: Set the correct background color
        bg={useColorModeValue("grey.100", "grey.100")}
      />
      {/* TODO: Set the correct background color */}
      <DrawerContent
        mt={HEADER_HEIGHT}
        bg={useColorModeValue("white", "white")}
      >
        <DrawerBody>
          {/* TODO: Add a documentation */}
          <TextMd>Documentation</TextMd>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

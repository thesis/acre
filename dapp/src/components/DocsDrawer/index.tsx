import React from "react"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextMd } from "#/components/shared/Typography"

export default function DocsDrawer() {
  const { isOpen, onClose } = useDocsDrawer()

  return (
    <Drawer size="xl" placement="right" isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay mt="header_height" />
      <DrawerContent mt="header_height">
        <DrawerBody>
          {/* TODO: Add a documentation */}
          <TextMd>Documentation</TextMd>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

import React from "react"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/react"
import { useDocsDrawer } from "../../hooks"
import { TextMd } from "../Typography"
import { HEADER_HEIGHT } from "../Header"

export default function DocsDrawer() {
  const { isOpen, onClose } = useDocsDrawer()

  return (
    <Drawer size="xl" placement="right" isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay mt={HEADER_HEIGHT} />
      <DrawerContent mt={HEADER_HEIGHT}>
        <DrawerBody>
          {/* TODO: Add a documentation */}
          <TextMd>Documentation</TextMd>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

import React from "react"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  Text,
  DrawerOverlay,
  useColorModeValue,
} from "@chakra-ui/react"
import { useDocsDrawerContext } from "../../hooks"

export default function DocsDrawer() {
  const { isOpen, onClose } = useDocsDrawerContext()

  return (
    <Drawer size="lg" placement="right" isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay />
      {/* TODO: Set the correct background color */}
      <DrawerContent bg={useColorModeValue("grey.100", "grey.100")}>
        <DrawerBody>
          {/* TODO: Add a documentation */}
          <Text>Documentation</Text>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

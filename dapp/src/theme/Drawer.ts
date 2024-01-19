import { drawerAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleDialogContainer = defineStyle({
  zIndex: "drawer",
})

const baseStyleDialog = defineStyle({
  borderTop: "2px",
  borderLeft: "2px",
  boxShadow: "none",
  borderColor: "white",
  borderTopLeftRadius: "xl",
  bg: "gold.100",
})

const baseStyleOverlay = defineStyle({
  bg: "none",
  backdropFilter: "auto",
  backdropBlur: "8px",
})

const baseStyle = definePartsStyle({
  dialogContainer: baseStyleDialogContainer,
  dialog: baseStyleDialog,
  overlay: baseStyleOverlay,
})

export const drawerTheme = defineMultiStyleConfig({ baseStyle })

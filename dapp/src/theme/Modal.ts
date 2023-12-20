import { modalAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleDialog = defineStyle({
  p: 4,
  border: "2px",
  boxShadow: "none",
  borderColor: "white",
  borderRadius: "xl",
  bg: "gold.100",
})

const baseCloseButton = defineStyle({
  top: -10,
  right: -10,
  rounded: "100%",
  bg: "opacity.white.5",
})

const baseStyleOverlay = defineStyle({
  bg: "none",
  backdropFilter: "auto",
  backdropBlur: "8px",
})

const baseStyle = definePartsStyle({
  dialog: baseStyleDialog,
  closeButton: baseCloseButton,
  overlay: baseStyleOverlay,
})

const Modal = defineMultiStyleConfig({ baseStyle })

export default Modal

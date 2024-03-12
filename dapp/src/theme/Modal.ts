import { modalAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

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
  height: 7,
  width: 7,
  p: 1.5,
  rounded: "100%",
  bg: "opacity.white.5",

  _hover: {
    bg: "opacity.white.5",
  },
})

const baseStyleOverlay = defineStyle({
  bg: "none",
  backdropFilter: "auto",
  backdropBlur: "8px",
})

const baseStyleHeader = defineStyle({
  textAlign: "center",
  fontSize: "lg",
  lineHeight: "lg",
  fontWeight: "bold",
  py: 6,
})

const baseStyleBody = defineStyle({
  textAlign: "center",
  color: "grey.600",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  dialog: baseStyleDialog,
  closeButton: baseCloseButton,
  overlay: baseStyleOverlay,
  header: baseStyleHeader,
  body: baseStyleBody,
})

export const modalTheme = multiStyleConfig.defineMultiStyleConfig({ baseStyle })

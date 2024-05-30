import { modalAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const baseStyleDialog = defineStyle({
  borderWidth: "var(--chakra-space-modal_borderWidth)",
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
  textAlign: "left",
  fontSize: "lg",
  lineHeight: "lg",
  fontWeight: "bold",
  pt: 10,
  px: 10,
  pb: 8,
})

const baseStyleBody = defineStyle({
  textAlign: "center",
  color: "grey.600",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  pt: 0,
  px: 8,
  pb: 10,
})

const baseStyleFooter = defineStyle({
  flexDirection: "column",
  gap: 6,
  px: 8,
  pb: 10,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  dialog: baseStyleDialog,
  closeButton: baseCloseButton,
  overlay: baseStyleOverlay,
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
})

const sizeXl = multiStyleConfig.definePartsStyle({
  dialog: { maxW: "46.75rem" },
})

const sizes = {
  xl: sizeXl,
}

export const modalTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  sizes,
})

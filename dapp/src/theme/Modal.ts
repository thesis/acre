import { modalAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const baseStyleContainer = defineStyle({
  px: 8,
})

const baseStyleDialog = defineStyle({
  marginTop: "var(--chakra-space-modal_shift)",
  marginBottom: 8,
  borderWidth: "2px",
  boxShadow: "none",
  borderColor: "white",
  borderRadius: "xl",
  bg: "gold.100",
})

const baseCloseButton = defineStyle({
  top: -7,
  right: -7,
  boxSize: 7,
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
  dialogContainer: baseStyleContainer,
  dialog: baseStyleDialog,
  closeButton: baseCloseButton,
  overlay: baseStyleOverlay,
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
})

const unstyledVariant = multiStyleConfig.definePartsStyle({
  dialog: { bg: "none", borderWidth: 0 },
  overlay: { bg: "opacity.gold.300.75" },
})

const variants = {
  unstyled: unstyledVariant,
}

const sizeXl = multiStyleConfig.definePartsStyle({
  dialog: { maxW: "46.75rem" },
})

const sizeLg = multiStyleConfig.definePartsStyle({
  dialog: { w: "30rem" },
})

const sizeFull = multiStyleConfig.definePartsStyle({
  dialog: { w: "100%", h: "100%" },
})

const sizes = {
  full: sizeFull,
  xl: sizeXl,
  lg: sizeLg,
}

export const modalTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants,
})

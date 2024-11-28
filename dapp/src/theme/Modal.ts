import { modalAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const baseStyleContainer = defineStyle({
  px: { base: 3, md: 8 },
})

const baseStyleDialog = defineStyle({
  marginTop: { base: 12, sm: "var(--chakra-space-modal_shift)" },
  marginBottom: 8,
  boxShadow: "none",
  borderRadius: "xl",
  p: { base: 5, sm: 0 },
  bg: "gold.100",
  border: "none",
})

const baseCloseButton = defineStyle({
  top: { base: 3, sm: -7 },
  right: { base: 3, sm: -7 },
  boxSize: { sm: 7 },
  rounded: { sm: "100%" },
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
  fontSize: "xl",
  lineHeight: "xl",
  fontWeight: "bold",
  pt: { sm: 10 },
  px: { sm: 10 },
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
  px: { base: 0, sm: 8 },
  pb: { base: 0, sm: 10 },
})

const baseStyleFooter = defineStyle({
  flexDirection: "column",
  gap: 6,
  px: { base: 0, sm: 8 },
  pb: { base: 0, sm: 10 },
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
  dialog: { maxW: "52rem" },
})

const sizeLg = multiStyleConfig.definePartsStyle({
  dialog: { w: { xs: "95%" } },
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

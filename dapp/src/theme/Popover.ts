import { popoverAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyleCloseButton = defineStyle({
  top: 5,
  right: 5,
})

const baseStyleContent = defineStyle({
  borderRadius: "xl",
  bg: "gold.100",
  borderWidth: 0.5,
  borderColor: "white",
  p: 5,

  _focusVisible: {
    boxShadow: "none",
  },
})

const variantNoTransform = multiStyleConfig.definePartsStyle({
  popper: {
    transform: "none !important",
  },
})

const variants = {
  "no-transform": variantNoTransform,
}

const baseStyle = multiStyleConfig.definePartsStyle({
  content: baseStyleContent,
  closeButton: baseStyleCloseButton,
})

export const popoverTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

import { popoverAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStylePopper = defineStyle({
  transform: "none !important",
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

const baseStyle = multiStyleConfig.definePartsStyle({
  popper: baseStylePopper,
  content: baseStyleContent,
})

export const popoverTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

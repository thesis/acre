import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

import { formErrorAnatomy as parts } from "@chakra-ui/anatomy"

const baseStyleText = defineStyle({
  fontWeight: "medium",
  color: "grey.700",
  mt: 4,
  fontSize: "md",
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  text: baseStyleText,
})

export const formErrorTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

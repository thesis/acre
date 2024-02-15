import { tagAnatomy as parts } from "@chakra-ui/anatomy"
import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

const tagStyle = defineStyle({
  borderRadius: "full",
  w: "fit-content",
  bg: "gold.100",
  borderColor: "white",
  borderWidth: 1,
  paddingX: 4,
  paddingY: 2.5,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({ container: tagStyle })

export const tagTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

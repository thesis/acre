import { tagAnatomy as parts } from "@chakra-ui/anatomy"
import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

const containerStyle = defineStyle({
  borderRadius: "full",
  w: "fit-content",
  bg: "gold.100",
  paddingX: 4,
  paddingY: 2.5,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

export const tagTheme = multiStyleConfig.defineMultiStyleConfig({
  defaultProps: { variant: "outline" },
  baseStyle: {
    container: containerStyle,
  },
  variants: {
    solid: {
      container: {
        borderWidth: 0,
      },
    },
    outline: {
      container: {
        borderColor: "white",
        borderWidth: 1,
      },
    },
  },
})

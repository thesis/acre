import { defineStyle, defineStyleConfig, cssVar } from "@chakra-ui/react"

const $startColor = cssVar("skeleton-start-color")
const $endColor = cssVar("skeleton-end-color")

const baseStyle = defineStyle({
  borderRadius: "lg",

  _light: {
    [$startColor.variable]: "colors.surface.4",
    [$endColor.variable]: "colors.surface.3",
  },
  _dark: {
    [$startColor.variable]: "colors.surface.4",
    [$endColor.variable]: "colors.surface.3",
  },
})

export default defineStyleConfig({ baseStyle })

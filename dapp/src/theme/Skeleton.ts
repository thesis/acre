import { defineStyle, defineStyleConfig, cssVar } from "@chakra-ui/react"

const $startColor = cssVar("skeleton-start-color")
const $endColor = cssVar("skeleton-end-color")

const baseStyle = defineStyle({
  borderRadius: "lg",

  _light: {
    [$startColor.variable]: "colors.gold.300",
    [$endColor.variable]: "colors.gold.200",
  },
  _dark: {
    [$startColor.variable]: "colors.gold.300",
    [$endColor.variable]: "colors.gold.200",
  },
})

export const skeletonTheme = defineStyleConfig({ baseStyle })

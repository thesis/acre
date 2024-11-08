import {
  Tooltip as ChakraTooltip,
  cssVar,
  defineStyle,
  defineStyleConfig,
} from "@chakra-ui/react"

// Currently, there is no possibility to set all tooltips with hasArrow by
// defaultProps. Let's override the defaultProps as follows.
ChakraTooltip.defaultProps = { ...ChakraTooltip.defaultProps, hasArrow: true }

// To make the arrow the same color as the background, the css variable needs to
// be set correctly.
// More info:
// https://github.com/chakra-ui/chakra-ui/issues/4695#issuecomment-991023319
const $arrowBg = cssVar("popper-arrow-bg")

const baseStyle = defineStyle({
  color: "gold.100",
  bg: "grey.700",
  [$arrowBg.variable]: "colors.grey.700",
})

const sizeXs = defineStyle({
  px: 2,
  py: 1,
  fontSize: "xs",
  lineHeight: "xs",
  borderRadius: "base",
})

const sizeSm = defineStyle({
  p: 3,
  fontSize: "sm",
  lineHeight: "sm",
  borderRadius: "lg",
})

const sizes = {
  xs: sizeXs,
  sm: sizeSm,
}

export const tooltipTheme = defineStyleConfig({
  defaultProps: {
    size: "sm",
  },
  baseStyle,
  sizes,
})

import {
  ComponentSingleStyleConfig,
  Tooltip as ChakraTooltip,
  cssVar,
} from "@chakra-ui/react"

// Currently, there is no possibility to set all tooltips with hasArrow by
// defaultProps. Let's override the defaultProps as follows.
ChakraTooltip.defaultProps = { ...ChakraTooltip.defaultProps, hasArrow: true }

// To make the arrow the same color as the background, the css variable needs to
// be set correctly.
// More info:
// https://github.com/chakra-ui/chakra-ui/issues/4695#issuecomment-991023319
const $arrowBg = cssVar("popper-arrow-bg")

export const tooltipTheme: ComponentSingleStyleConfig = {
  baseStyle: {
    borderRadius: "md",
    bg: "grey.700",
    [$arrowBg.variable]: "colors.grey.700",
  },
}

import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "indicator"]
const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const containerBaseStyle = defineStyle({
  fontWeight: "semibold",
  fontSize: "sm",
  lineHeight: "sm",

  _hover: {
    textDecoration: "none",
  },
})

const navigationContainerStyles = defineStyle({
  display: "block",
  fontSize: "md",
  lineHeight: "md",
  fontWeight: "bold",
  marginBottom: 2,
  color: "grey.500",
  _activeLink: { color: "grey.700" },
})

const navigationIndicatorStyles = defineStyle({
  pos: "absolute",
  bottom: 0.5,
  left: 0,
  w: "full",
  h: 0.5,
  bg: "brand.400",
})

export const linkTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle: {
    container: containerBaseStyle,
  },
  variants: {
    navigation: {
      container: navigationContainerStyles,
      indicator: navigationIndicatorStyles,
    },
  },
})

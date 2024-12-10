import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "indicator"]
const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const containerBaseStyle = defineStyle({
  fontWeight: "semibold",

  _hover: {
    textDecoration: "none",
  },
})

const navigationContainerStyles = defineStyle({
  fontWeight: "medium",
  color: "grey.700",
  _activeLink: { color: "brand.400" },
})

const sizeSm = multiStyleConfig.definePartsStyle({
  container: {
    fontSize: "sm",
    lineHeight: "sm",
  },
})

const sizeMd = multiStyleConfig.definePartsStyle({
  container: {
    fontSize: "md",
    lineHeight: "md",
  },
})

const sizes = {
  sm: sizeSm,
  md: sizeMd,
}

export const linkTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle: {
    container: containerBaseStyle,
    size: "sm",
  },
  variants: {
    navigation: {
      container: navigationContainerStyles,
    },
  },
  sizes,
})

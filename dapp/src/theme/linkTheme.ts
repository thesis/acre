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
  color: "text.primary",
  _activeLink: { color: "acre.50" },
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

export default multiStyleConfig.defineMultiStyleConfig({
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

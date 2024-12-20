import { tagAnatomy as parts } from "@chakra-ui/anatomy"
import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyleContainer = defineStyle({
  borderRadius: "full",
  w: "fit-content",
  color: "grey.700",
  bg: "gold.200",
  paddingX: 4,
  paddingY: 2.5,
  shadow: "none",
})

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseStyleContainer,
})

const variantSolid = multiStyleConfig.definePartsStyle({
  container: {
    borderWidth: 0,
  },
})

const variantOutline = multiStyleConfig.definePartsStyle({
  container: {
    borderColor: "white",
    borderWidth: 1,
  },
})

const variants = {
  solid: variantSolid,
  outline: variantOutline,
}

export default multiStyleConfig.defineMultiStyleConfig({
  defaultProps: { variant: "outline" },
  baseStyle,
  variants,
})

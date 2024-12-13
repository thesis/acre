import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const variantOutlineField = defineStyle({
  boxShadow: "none !important",
  border: "1px solid",
  borderColor: "gold.300",
  color: "grey.700",
  fontWeight: "bold",
  bg: "opacity.white.5",
  paddingRight: 20,
  minH: 14,
  // TODO: Set the color correctly without using the chakra variable.
  caretColor: "var(--chakra-colors-brand-400)",

  _placeholder: {
    color: "grey.300",
    fontWeight: "medium",
  },

  _hover: {
    borderColor: "gold.300",
  },

  _focus: {
    borderColor: "gold.300",
  },

  _invalid: {
    borderColor: "red.400 !important",
  },
})

const variantOutlineElement = defineStyle({
  h: "100%",
  width: 14,
  mr: 2,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const variantOutline = multiStyleConfig.definePartsStyle({
  field: variantOutlineField,
  element: variantOutlineElement,
})

const variants = {
  outline: variantOutline,
}

export default multiStyleConfig.defineMultiStyleConfig({
  variants,
  defaultProps: {
    variant: "outline",
  },
})

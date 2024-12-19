import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const variantOutlineField = defineStyle({
  boxShadow: "none !important",
  border: "1px solid",
  borderColor: "surface.4",
  color: "text.primary",
  fontWeight: "bold",
  bg: "surface.1",
  paddingRight: 20,
  minH: 14,
  // TODO: Set the color correctly without using the chakra variable.
  caretColor: "var(--chakra-colors-acre-50)",

  _placeholder: {
    color: "brown.30",
    fontWeight: "medium",
  },

  _hover: {
    borderColor: "surface.4",
  },

  _focus: {
    borderColor: "surface.4",
  },

  _invalid: {
    borderColor: "red.50 !important",
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

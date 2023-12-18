import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const variantBalanceField = defineStyle({
  border: "1px solid",
  borderColor: "gold.300",
  color: "grey.700",
  fontWeight: "bold",
  bg: "opacity.white.5",
  paddingRight: 20,
  // TODO: Set the color correctly without using the chakra variable.
  caretColor: "var(--chakra-colors-brand-400)",

  _placeholder: {
    color: "grey.300",
    fontWeight: "medium",
  },
})

const variantBalanceElement = defineStyle({
  h: "100%",
  width: 14,
  mr: 2,
})

const variantBalance = definePartsStyle({
  field: variantBalanceField,
  element: variantBalanceElement,
})

const variants = {
  balance: variantBalance,
}

const Input = defineMultiStyleConfig({ variants })

export default Input

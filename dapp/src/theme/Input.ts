import { inputAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

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

  _invalid: {
    color: "red.400",
  },
})

const variantBalanceElement = defineStyle({
  h: "100%",
  width: 14,
  mr: 2,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const variantBalance = multiStyleConfig.definePartsStyle({
  field: variantBalanceField,
  element: variantBalanceElement,
})

const variants = {
  balance: variantBalance,
}

const Input = multiStyleConfig.defineMultiStyleConfig({ variants })

export default Input

import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  color: "brand.400",
  borderWidth: 2,
  borderBottomColor: "brand.400",
})

const variantFilled = defineStyle({
  borderWidth: 3,
  borderTopColor: "gold.400",
  borderBottomColor: "gold.400",
  borderLeftColor: "gold.400",
})

const variants = {
  filled: variantFilled,
}

const sizeXl = defineStyle({
  width: 16,
  height: 16,
})

const size2Xl = defineStyle({
  width: 20,
  height: 20,
})

const sizes = {
  xl: sizeXl,
  "2xl": size2Xl,
}

export const spinnerTheme = defineStyleConfig({ baseStyle, sizes, variants })

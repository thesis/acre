import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  color: "acre.50",
  borderWidth: 2,
  borderBottomColor: "acre.50",
})

const variantFilled = defineStyle({
  borderWidth: 3,
  borderTopColor: "brown.20",
  borderBottomColor: "brown.20",
  borderLeftColor: "brown.20",
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

export default defineStyleConfig({
  baseStyle,
  sizes,
  variants,
})

import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  color: "brand.400",
  borderWidth: 3,
  borderTopColor: "gold.400",
  borderBottomColor: "gold.400",
  borderLeftColor: "gold.400",
})

const sizeXl = defineStyle({
  w: 16,
  h: 16,
})

const sizes = {
  xl: sizeXl,
}

const Spinner = defineStyleConfig({ baseStyle, sizes })

export default Spinner

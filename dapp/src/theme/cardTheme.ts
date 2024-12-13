import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"
import { cardAnatomy as parts } from "@chakra-ui/anatomy"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyleContainer = defineStyle({
  boxShadow: "none",
  bg: "gold.200",
  borderRadius: "xl",
  p: 5,
})

const baseStyleHeader = defineStyle({
  p: 0,
})

const baseStyleBody = defineStyle({
  p: 0,
})

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseStyleContainer,
  header: baseStyleHeader,
  body: baseStyleBody,
})

export default multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

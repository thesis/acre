import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"
import { cardAnatomy as parts } from "@chakra-ui/anatomy"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyleContainer = defineStyle({
  boxShadow: "none",
  bg: "gold.200",
  borderRadius: "xl",
  padding: 5,
})

const baseStyleHeader = defineStyle({
  padding: 0,
})

const baseStyleBody = defineStyle({
  padding: 0,
})

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseStyleContainer,
  header: baseStyleHeader,
  body: baseStyleBody,
})

export const cardTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

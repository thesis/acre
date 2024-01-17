import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

import { formErrorAnatomy as parts } from "@chakra-ui/anatomy"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleText = defineStyle({
  fontWeight: "medium",
  color: "red.400",
})

const baseStyle = definePartsStyle({
  text: baseStyleText,
})

export const formErrorTheme = defineMultiStyleConfig({ baseStyle })

import { formAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleHelperText = defineStyle({
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontWeight: "medium",
  color: "grey.500",
})

const baseStyle = definePartsStyle({
  helperText: baseStyleHelperText,
})

export const formTheme = defineMultiStyleConfig({ baseStyle })

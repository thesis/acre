import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  bg: "transparent",
})

export const closeButtonTheme = defineStyleConfig({
  baseStyle,
})

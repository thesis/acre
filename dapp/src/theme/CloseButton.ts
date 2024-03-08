import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  _hover: {
    bg: "none",
  },
})

export const closeButtonTheme = defineStyleConfig({
  baseStyle,
})

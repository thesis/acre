import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  _hover: {
    textDecoration: "none",
  },
})

export const linkTheme = defineStyleConfig({
  baseStyle,
})

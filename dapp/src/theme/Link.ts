import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  fontWeight: "semibold",
  fontSize: "sm",
  lineHeight: "sm",

  _hover: {
    textDecoration: "none",
  },
})

export const linkTheme = defineStyleConfig({
  baseStyle,
})

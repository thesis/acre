import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  fontWeight: "medium",
})

const sizes = {
  xs: {
    fontSize: "xs",
    lineHeight: "xs",
  },
  sm: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  md: {
    fontSize: "md",
    lineHeight: "md",
  },
  lg: {
    fontSize: "lg",
    lineHeight: "lg",
  },
  xl: {
    fontSize: "xl",
    lineHeight: "xl",
  },
  "2xl": {
    fontSize: "2xl",
    lineHeight: "2xl",
  },
  "3xl": {
    fontSize: "3xl",
    lineHeight: "3xl",
  },
  "4xl": {
    fontSize: "4xl",
    lineHeight: "4xl",
  },
  "5xl": {
    fontSize: "5xl",
    lineHeight: "5xl",
  },
  "6xl": {
    fontSize: "6xl",
    lineHeight: "6xl",
  },
  "7xl": {
    fontSize: "7xl",
    lineHeight: "7xl",
  },
  "8xl": {
    fontSize: "8xl",
    lineHeight: "8xl",
  },
  "9xl": {
    fontSize: "9xl",
    lineHeight: "9xl",
  },
}

export default defineStyleConfig({ baseStyle, sizes })

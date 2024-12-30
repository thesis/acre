import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  fontWeight: "semibold",
  color: "text.primary",
})

const sizeMd = defineStyle({
  fontSize: "sm",
  lineHeight: "sm",
})

const sizeLg = defineStyle({
  fontSize: "md",
  lineHeight: "md",
})

const sizes = {
  md: sizeMd,
  lg: sizeLg,
}

export default defineStyleConfig({ baseStyle, sizes })

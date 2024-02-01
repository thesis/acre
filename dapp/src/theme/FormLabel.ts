import { defineStyle, defineStyleConfig } from "@chakra-ui/react"

const baseStyle = defineStyle({
  fontWeight: "semibold",
  color: "grey.700",
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

export const formLabelTheme = defineStyleConfig({ baseStyle, sizes })

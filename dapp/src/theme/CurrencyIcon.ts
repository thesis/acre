import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "symbol"]

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(PARTS)

const baseStyleContainer = defineStyle({
  display: "flex",
  flexDirection: "row",
  gap: 2.5,
})

const baseStyleSymbol = defineStyle({
  fontWeight: "semibold",
  fontSize: "sm",
  lineHeight: "sm",
})

const baseStyle = definePartsStyle({
  container: baseStyleContainer,
  symbol: baseStyleSymbol,
})

export const currencyIconTheme = defineMultiStyleConfig({ baseStyle })

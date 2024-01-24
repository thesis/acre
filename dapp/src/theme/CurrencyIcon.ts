import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "symbol"]

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

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

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseStyleContainer,
  symbol: baseStyleSymbol,
})

export const currencyIconTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

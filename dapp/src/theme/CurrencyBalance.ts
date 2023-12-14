import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["balance", "symbol"]

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(PARTS)

const baseStyleBalance = defineStyle({
  fontWeight: "bold",
  fontSize: "md",
  lineHeight: "md",
  mr: 1,
})

const baseStyleSymbol = defineStyle({
  fontWeight: "bold",
  fontSize: "md",
  lineHeight: "md",
})

const baseStyle = definePartsStyle({
  balance: baseStyleBalance,
  symbol: baseStyleSymbol,
})

const variantGreaterBalance = definePartsStyle({
  balance: {
    fontSize: "4xl",
    lineHeight: "4xl",
  },
  symbol: {
    fontSize: "xl",
    lineHeight: "xl",
  },
})

const variants = {
  "greater-balance": variantGreaterBalance,
}

const sizeXs = definePartsStyle({
  balance: {
    fontSize: "xs",
    lineHeight: "xs",
  },
  symbol: {
    fontSize: "xs",
    lineHeight: "xs",
  },
})

const sizeSm = definePartsStyle({
  balance: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  symbol: {
    fontSize: "sm",
    lineHeight: "sm",
  },
})

const sizeMd = definePartsStyle({
  balance: {
    fontSize: "md",
    lineHeight: "md",
  },
  symbol: {
    fontSize: "md",
    lineHeight: "md",
  },
})

const sizeLg = definePartsStyle({
  balance: {
    fontSize: "lg",
    lineHeight: "lg",
  },
  symbol: {
    fontSize: "lg",
    lineHeight: "lg",
  },
})

const sizeXl = definePartsStyle({
  balance: {
    fontSize: "xl",
    lineHeight: "xl",
  },
  symbol: {
    fontSize: "xl",
    lineHeight: "xl",
  },
})

const sizes = {
  xs: sizeXs,
  sm: sizeSm,
  md: sizeMd,
  lg: sizeLg,
  xl: sizeXl,
}

const CurrencyBalance = defineMultiStyleConfig({ baseStyle, variants, sizes })

export default CurrencyBalance

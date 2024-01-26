import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["balance", "symbol"]

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

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  balance: baseStyleBalance,
  symbol: baseStyleSymbol,
})

const variantGreaterBalance = multiStyleConfig.definePartsStyle({
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

const sizeXs = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "xs",
    lineHeight: "xs",
  },
  symbol: {
    fontSize: "xs",
    lineHeight: "xs",
  },
})

const sizeSm = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  symbol: {
    fontSize: "sm",
    lineHeight: "sm",
  },
})

const sizeMd = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "md",
    lineHeight: "md",
  },
  symbol: {
    fontSize: "md",
    lineHeight: "md",
  },
})

const sizeLg = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "lg",
    lineHeight: "lg",
  },
  symbol: {
    fontSize: "lg",
    lineHeight: "lg",
  },
})

const sizeXl = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "xl",
    lineHeight: "xl",
  },
  symbol: {
    fontSize: "xl",
    lineHeight: "xl",
  },
})

const size4Xl = definePartsStyle({
  balance: {
    fontSize: "4xl",
    lineHeight: "4xl",
  },
  symbol: {
    fontSize: "4xl",
    lineHeight: "4xl",
  },
})

const sizes = {
  xs: sizeXs,
  sm: sizeSm,
  md: sizeMd,
  lg: sizeLg,
  xl: sizeXl,
  "4xl": size4Xl,
}

export const currencyBalanceTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
})

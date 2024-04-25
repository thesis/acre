import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "balance", "symbol"]

const baseStyleContainer = defineStyle(({ symbolPosition }) => ({
  display: "flex",
  flexDir: symbolPosition === "prefix" ? "row-reverse" : "row",
}))

const baseStyleBalance = defineStyle(({ symbolPosition }) => ({
  fontWeight: "bold",
  fontSize: "md",
  lineHeight: "md",
  [symbolPosition === "prefix" ? "ml" : "mr"]: "0.5ch", // dynamic value based on font size
}))

const baseStyleSymbol = defineStyle({
  fontSize: "md",
  lineHeight: "md",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle((props) => ({
  container: baseStyleContainer(props),
  balance: baseStyleBalance(props),
  symbol: baseStyleSymbol,
}))

const variantGreaterBalanceXl = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "4xl",
    lineHeight: "4xl",
  },
  symbol: {
    fontSize: "xl",
    lineHeight: "xl",
  },
})

const variantGreaterBalanceXxl = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "5xl",
    lineHeight: "5xl",
  },
  symbol: {
    fontSize: "2xl",
    lineHeight: "2xl",
  },
})

const variants = {
  "greater-balance-xl": variantGreaterBalanceXl,
  "greater-balance-xxl": variantGreaterBalanceXxl,
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

const size4Xl = multiStyleConfig.definePartsStyle({
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

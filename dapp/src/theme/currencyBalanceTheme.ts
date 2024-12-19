import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "balance", "symbol"]

const baseStyleContainer = defineStyle(({ symbolPosition }) => ({
  display: "inline-flex",
  flexDir: symbolPosition === "prefix" ? "row-reverse" : "row",
  alignItems: "baseline",
}))

const baseStyleBalance = defineStyle(({ symbolPosition }) => ({
  fontWeight: "bold",
  fontSize: "md",
  lineHeight: "md",
  [symbolPosition === "prefix" ? "ml" : "mr"]: "0.5ch", // dynamic value based on font size
}))

const baseStyleSymbol = defineStyle({
  fontWeight: "bold",
  fontSize: "md",
  lineHeight: "md",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle((props) => ({
  container: baseStyleContainer(props),
  balance: baseStyleBalance(props),
  symbol: baseStyleSymbol,
}))

const variantGreaterBalanceMd = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "lg",
    lineHeight: "lg",
  },
  symbol: {
    fontSize: "md",
    lineHeight: "md",
  },
})

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
  "greater-balance-md": variantGreaterBalanceMd,
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

const size3Xl = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "3xl",
    lineHeight: "3xl",
  },
  symbol: {
    fontSize: "3xl",
    lineHeight: "3xl",
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

const size6Xl = multiStyleConfig.definePartsStyle({
  balance: {
    fontSize: "6xl",
    lineHeight: "6xl",
  },
  symbol: {
    fontSize: "6xl",
    lineHeight: "6xl",
  },
})

const sizes = {
  xs: sizeXs,
  sm: sizeSm,
  md: sizeMd,
  lg: sizeLg,
  xl: sizeXl,
  "3xl": size3Xl,
  "4xl": size4Xl,
  "6xl": size6Xl,
}

export default multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
})

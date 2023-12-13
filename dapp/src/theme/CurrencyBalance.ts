import { ComponentMultiStyleConfig } from "@chakra-ui/react"

const CurrencyBalance: ComponentMultiStyleConfig = {
  parts: ["balance", "symbol"],
  baseStyle: {
    balance: {
      fontWeight: "bold",
      fontSize: "md",
      lineHeight: "md",
      mr: 1,
    },
    symbol: {
      fontWeight: "bold",
      fontSize: "md",
      lineHeight: "md",
    },
  },
  variants: {
    "greater-balance": {
      balance: {
        fontSize: "4xl",
        lineHeight: "4xl",
      },
      symbol: {
        fontSize: "xl",
        lineHeight: "xl",
      },
    },
  },
  sizes: {
    xs: {
      balance: {
        fontSize: "xs",
        lineHeight: "xs",
      },
      symbol: {
        fontSize: "xs",
        lineHeight: "xs",
      },
    },
    sm: {
      balance: {
        fontSize: "sm",
        lineHeight: "sm",
      },
      symbol: {
        fontSize: "sm",
        lineHeight: "sm",
      },
    },
    md: {
      balance: {
        fontSize: "md",
        lineHeight: "md",
      },
      symbol: {
        fontSize: "md",
        lineHeight: "md",
      },
    },
    lg: {
      balance: {
        fontSize: "lg",
        lineHeight: "lg",
      },
      symbol: {
        fontSize: "lg",
        lineHeight: "lg",
      },
    },
    xl: {
      balance: {
        fontSize: "xl",
        lineHeight: "xl",
      },
      symbol: {
        fontSize: "xl",
        lineHeight: "xl",
      },
    },
  },
}

export default CurrencyBalance

import { ComponentMultiStyleConfig, StyleFunctionProps } from "@chakra-ui/react"
import { cardAnatomy as parts } from "@chakra-ui/anatomy"

export const cardTheme: ComponentMultiStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: "none",
      borderColor: "gold.100",
      bg: "gold.200",
    },
  },
  parts: parts.keys,
  variants: {
    elevated: ({ colorScheme }: StyleFunctionProps) => {
      if (!colorScheme) return {}

      return {
        container: {
          bg: "gold.100",
          borderColor: "white",
        },
      }
    },
  },
  sizes: {
    md: {
      container: {
        borderWidth: "1px",
      },
    },
    lg: {
      container: {
        borderWidth: "2px",
      },
    },
  },
  defaultProps: {
    size: "lg",
  },
}

import {
  ComponentSingleStyleConfig,
  StyleFunctionProps,
} from "@chakra-ui/react"

export const cardTheme: ComponentSingleStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: "none",
      borderColor: "gold.100",
      bg: "gold.200",
    },
  },
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
    "current-season": {
      container: {
        bg: "brand.400",
        borderWidth: 0,
        gap: 4,
        rounded: "xl",
        px: 5,
        py: 4,
      },
      header: {
        p: 0,
        color: "gold.100",
        fontSize: "2xl",
        lineHeight: 1,
        fontWeight: "bold",
        letterSpacing: "-0.03rem", // -0.48px
      },
      body: {
        p: 0,
      },
      footer: {
        p: 0,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        fontSize: "md",
        fontWeight: "medium",
        color: "white",
      },
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

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
    icon: {
      // @ts-expect-error To override false positive types error
      container: {
        px: 6,
        py: 5,
        bg: "gold.300",
        display: "grid",
        gridAutoFlow: "row",
        gridAutoColumns: "1fr auto",
        gridTemplateRows: "auto 1fr",
        maxH: { base: "auto", xl: 40 },
        gap: { base: 2, xl: 0 },
      },
      header: {
        p: 0,
        fontSize: "2xl",
        lineHeight: 8,
        fontWeight: "bold",
        color: "grey.700",
      },
      body: {
        p: 0,
        fontSize: "md",
        mt: { base: "0", xl: "auto" },
        lineHeight: 6,
        fontWeight: "medium",
        color: "grey.500",
        flex: 0,
      },
      footer: {
        px: { base: 4, xl: 20 },
        py: 0,
        gridArea: { base: "unset", xl: "1 / 2 / 3 / 3" },
        alignSelf: "end",
        ml: { base: "auto", xl: -6 },
        mr: -6,
        mt: { base: "auto", xl: -5 },
        mb: -5,
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

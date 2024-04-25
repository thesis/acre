import { ComponentMultiStyleConfig, StyleFunctionProps } from "@chakra-ui/react"
import contentCardBackground from "#/assets/images/content-card-bg.png"
import valueCardDecorator from "#/assets/images/card-value-decorator.svg"

export const cardTheme: ComponentMultiStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: "none",
      borderColor: "gold.100",
      bg: "gold.200",
    },
  },
  parts: ["container", "header", "body", "footer"],
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
      container: {
        px: 6,
        py: 5,
        bg: "gold.300",
        display: "grid",
        gridAutoFlow: "row",
        gridAutoColumns: "1fr auto",
        gridTemplateRows: "auto 1fr",
        maxH: { base: "auto", "2xl": "11.25rem" }, // 180px
        gap: { base: 2, "2xl": 0 },
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
        mt: { base: "0", "2xl": "auto" },
        lineHeight: 6,
        fontWeight: "medium",
        color: "grey.500",
        flex: 0,
      },
      footer: {
        px: 6,
        py: 0,
        gridArea: { base: "unset", "2xl": "1 / 2 / 3 / 3" },
        alignSelf: "end",
        mx: -6,
        mt: { base: "auto", "2xl": -5 },
        mb: -5,
      },
    },
    value: {
      container: {
        p: 10,
        gap: 6,
        alignItems: "center",
      },
      header: {
        p: 0,
        fontSize: "md",
        lineHeight: 6,
        fontWeight: "normal",
        color: "grey.700",
      },
      body: {
        p: 0,
        fontSize: { base: "5xl", xl: "6xl" },
        lineHeight: 1.2,
        fontWeight: "semibold",
        color: "currentColor",
        letterSpacing: "0.075rem", // 1.2px
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        "&::before, &::after": {
          content: "''",
          mask: `url(${valueCardDecorator})`,
          maskSize: "contain",
          display: "inline-block",
          w: { base: "2.9rem", xl: "3.625rem" }, // 46,8px, 58px
          h: { base: 8, xl: 10 },
          transform: "auto",
          transformOrigin: "center",
          background: "currentColor",
          mx: 6,
        },
        _after: { rotate: 180 },
      },
      footer: {
        p: 0,
        fontSize: "md",
        lineHeight: 6,
        fontWeight: "semibold",
        color: "grey.700",
        gap: 20,
      },
    },
    content: ({ withBackground }) => ({
      container: {
        p: 10,
        gap: 10,
        alignItems: "center",
        position: "relative",
        _after: withBackground
          ? {
              content: "''",
              pos: "absolute",
              w: "full",
              h: "full",
              inset: 0,
              bgImage: contentCardBackground,
              bgSize: "cover",
              mixBlendMode: "overlay",
              opacity: 0.5,
              zIndex: 0,
            }
          : undefined,
      },
      header: {
        p: 0,
        fontSize: "md",
        lineHeight: 6,
        fontWeight: "semibold",
        color: "grey.700",
        zIndex: 1,
      },
      body: {
        p: 0,
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        gap: 12,
        flexFlow: { base: "column", xl: "row" },
        w: "full",
      },
    }),
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
    withBackground: false,
  },
}

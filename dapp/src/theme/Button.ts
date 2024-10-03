import {
  ComponentSingleStyleConfig,
  defineStyle,
  StyleFunctionProps,
} from "@chakra-ui/react"

// TODO: should be updated when style guide will be ready
const variantCard = defineStyle({
  h: 12,
  p: 3,
  pr: 4,
  fontWeight: "semibold",
  bg: "gold.200",
  color: "brand.400",

  _hover: {
    bg: "gold.400",
    textDecoration: "none",
  },
})

// TODO: Update the button styles correctly when ready
export const buttonTheme: ComponentSingleStyleConfig = {
  baseStyle: {
    // Remove a blue outline when the button is in focus.
    boxShadow: "none !important",
  },
  sizes: {
    md: {
      fontSize: "sm",
      py: 2,
      borderRadius: "md",
    },
    lg: {
      fontSize: "md",
      py: 4,
      borderRadius: "lg",
      h: 14,
    },
  },
  variants: {
    solid: ({ colorScheme }: StyleFunctionProps) => {
      let baseBg = `${colorScheme}.400`
      let hoverBg = `${colorScheme}.500`

      if (colorScheme === "green") {
        baseBg = `${colorScheme}.500`
        hoverBg = `${colorScheme}.600`
      }

      return {
        bg: baseBg,
        color: "white",
        _hover: {
          bg: hoverBg,
          _disabled: {
            bg: "grey.400",
          },
        },
        _active: {
          bg: baseBg,
        },
        _loading: {
          _disabled: {
            background: "gold.300",
            opacity: 1,
          },
        },
        _disabled: {
          bg: "grey.500",
          color: "gold.200",
        },
      }
    },
    outline: ({ colorScheme }: StyleFunctionProps) => {
      const defaultStyles = {
        color: "grey.700",
        borderColor: "grey.700",

        _hover: {
          bg: "opacity.grey.700.05",
        },
        _active: {
          bg: "transparent",
        },
        _loading: {
          _disabled: {
            borderColor: "white",
            background: "grey.300",
            opacity: 1,
          },
        },
      }
      if (colorScheme === "gold") {
        return {
          ...defaultStyles,
          bg: "gold.100",
          borderColor: "white",
          borderStyle: "solid",

          _hover: {
            borderColor: "grey.500",
            bg: "transparent",
          },
        }
      }

      if (colorScheme === "white") {
        return {
          ...defaultStyles,
          color: "white",
          borderColor: "white",

          _hover: {
            bg: "opacity.black.05",
          },
        }
      }
      return defaultStyles
    },
    ghost: {
      color: "inherit",
      _hover: {
        bg: "transparent",
      },
      _active: {
        bg: "transparent",
      },
    },
    card: variantCard,
    pagination: {
      bg: "white",
      color: "grey.700",
      ring: 0,
      ringInset: "inset",
      ringColor: "white",

      _hover: {
        color: "brand.400",
        bg: "opacity.white.6",
        ring: 1,
      },
      _active: {
        ring: 1,
        ringColor: "brand.400",
      },
      _disabled: {
        color: "grey.300",
        bg: "white",
        opacity: 1,
        pointerEvents: "none",
      },
    },
    link: {
      bg: "initial",
      color: "inherit",
      p: 0,
      textDecoration: "underline",
      fontWeight: "medium",
    },
  },
  defaultProps: {
    colorScheme: "brand",
  },
}

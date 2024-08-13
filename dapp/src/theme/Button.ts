import {
  ComponentSingleStyleConfig,
  StyleFunctionProps,
} from "@chakra-ui/react"

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
            background: "opacity.white.5",
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
      _hover: {
        bg: "transparent",
      },
      _active: {
        bg: "transparent",
      },
    },
    // FIXME: It should be removed and replaced by solid/outline variants
    card: ({ colorScheme }: StyleFunctionProps) => {
      const defaultStyles = {
        fontWeight: "medium",
        borderWidth: "1px",
        borderColor: "gold.100",
        bg: "gold.200",
        _hover: {
          bg: "transparent",
          borderColor: "grey.500",
        },
        _active: {
          bg: "transparent",
        },
      }

      if (colorScheme === "error") {
        return {
          ...defaultStyles,
          color: "red.400",
          _hover: {
            bg: "transparent",
            borderColor: "red.400",
          },
        }
      }

      return defaultStyles
    },
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

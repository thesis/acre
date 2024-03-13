import {
  ComponentSingleStyleConfig,
  StyleFunctionProps,
} from "@chakra-ui/react"

// TODO: Update the button styles correctly when ready
export const buttonTheme: ComponentSingleStyleConfig = {
  sizes: {
    md: {
      fontSize: "sm",
      py: "0.5rem",
      borderRadius: "md",
    },
    lg: {
      fontSize: "md",
      py: "1rem",
      borderRadius: "lg",
    },
  },
  variants: {
    solid: {
      bg: "brand.400",
      color: "white",
      _hover: {
        bg: "brand.500",
      },
      _active: {
        bg: "brand.400",
      },
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
      border: "1px solid transparent",

      _hover: {
        borderColor: "white",
        bg: "opacity.white.6",
      },
      _disabled: {
        color: "grey.200",
        bg: "white",
        opacity: 1,
        pointerEvents: "none",
      },
    },
  },
}

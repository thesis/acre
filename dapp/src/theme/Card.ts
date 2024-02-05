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
    // Disabled eslint rule, because property '_hover' is incompatible with index signature. It's mean that typescript doesn't recognize _hover property in container object.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activity: ({ colorScheme }: StyleFunctionProps): any => {
      const defaultStyles = {
        width: 64,
        paddingX: 5,
        paddingY: 3,
        borderWidth: 1,
        borderColor: "gold.100",
        bg: "gold.200",
        _hover: {
          boxShadow: "lg",
          bg: "gold.100",
          borderColor: "white",
        },
      }

      if (colorScheme === "gold") {
        return {
          container: {
            ...defaultStyles,
            boxShadow: "lg",
            bg: "gold.100",
          },
        }
      }

      if (colorScheme === "green") {
        return {
          container: {
            ...defaultStyles,
            bg: "green.200",
            borderColor: "green.100",
            _hover: {
              boxShadow: "lg",
              bg: "green.200",
              borderColor: "green.100",
            },
          },
        }
      }

      return {
        container: { ...defaultStyles },
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

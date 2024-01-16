import {
  ComponentSingleStyleConfig,
  StyleFunctionProps,
} from "@chakra-ui/react"

const Card: ComponentSingleStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: "none",
      borderWidth: "2px",
      borderColor: "gold.100",
      bg: "gold.200",
    },
  },
  variants: {
    elevated: ({ colorScheme }: StyleFunctionProps) => {
      if (!colorScheme) return {}

      return {
        container: {
          borderWidth: "1px",
          bg: "gold.100",
          borderColor: "white",
        },
      }
    },
  },
  defaultProps: {
    size: "lg",
  },
}

export default Card

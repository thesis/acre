import { ComponentSingleStyleConfig } from "@chakra-ui/react"

// TODO: Update the button styles correctly when ready
const Button: ComponentSingleStyleConfig = {
  baseStyle: {
    size: "md",
    borderRadius: "lg",
  },
  sizes: {
    md: {
      fontSize: "sm",
      py: "0.5rem",
    },
    lg: {
      fontSize: "md",
      py: "1rem",
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
    outline: {
      color: "grey.700",
      borderColor: "grey.700",
      _hover: {
        bg: "rgba(35, 31, 32, 0.05)",
      },
      _active: {
        bg: "transparent",
      },
    },
    card: {
      borderWidth: "2px",
      borderColor: "gold.100",
      borderRadius: "xl",
      bg: "gold.200",
      _hover: {
        bg: "rgba(35, 31, 32, 0.05)",
      },
      _active: {
        bg: "transparent",
      },
    },
  },
}

export default Button

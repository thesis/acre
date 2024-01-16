import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Card: ComponentSingleStyleConfig = {
  baseStyle: {
    container: {
      boxShadow: "none",
      borderWidth: "2px",
      borderColor: "gold.100",
      borderRadius: "xl",
      bg: "gold.200",
    },
  },
  variants: {
    light: {
      container: {
        bg: "gold.100",
        borderColor: "white",
        borderStyle: "solid",
        borderRadius: "md",
      },
    },
  },
}

export default Card

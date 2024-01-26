import { ComponentSingleStyleConfig } from "@chakra-ui/react"

export const switchTheme: ComponentSingleStyleConfig = {
  baseStyle: {
    track: {
      bg: "grey.700",
      _checked: {
        bg: "brand.400",
      },
    },
  },
}

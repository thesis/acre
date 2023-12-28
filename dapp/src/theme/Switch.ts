import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Switch: ComponentSingleStyleConfig = {
  baseStyle: {
    track: {
      bg: "grey.700",
      _checked: {
        bg: "brand.400",
      },
    },
  },
}

export default Switch

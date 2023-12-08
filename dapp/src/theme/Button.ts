import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"
import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Button: ComponentSingleStyleConfig = {
  baseStyle: {
    rounded: "none",
  },
  variants: {
    solid: (props: StyleFunctionProps) => ({
      // TODO: Update when the dark theme is ready
      backgroundColor: mode("brand.400", "brand.400")(props),
      color: "white",
    }),
    outline: (props: StyleFunctionProps) => ({
      // TODO: Update when the dark theme is ready
      color: mode("grey.700", "grey.700")(props),
      borderColor: mode("grey.700", "grey.700")(props),
    }),
    link: (props: StyleFunctionProps) => ({
      color: mode("black", "grey.50")(props),
      textDecoration: "underline",
    }),
  },
}

export default Button

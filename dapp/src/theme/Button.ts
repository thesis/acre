import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"
import { ComponentSingleStyleConfig } from "@chakra-ui/react"

const Button: ComponentSingleStyleConfig = {
  baseStyle: {
    rounded: "none",
  },
  variants: {
    solid: (props: StyleFunctionProps) => ({
      backgroundColor: mode("black", "purple")(props),
      color: "white",
    }),
    outline: (props: StyleFunctionProps) => ({
      color: mode("black", "grey.80")(props),
      borderColor: mode("black", "grey.50")(props),
    }),
    link: (props: StyleFunctionProps) => ({
      color: mode("black", "grey.50")(props),
      textDecoration: "underline",
    }),
  },
}

export default Button

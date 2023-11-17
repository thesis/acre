import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"

const Button = {
  variants: {
    solid: (props: StyleFunctionProps) => ({
      backgroundColor: mode("black", "purple")(props),
      color: "white",
    }),
  },
}

export default Button

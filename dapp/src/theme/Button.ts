import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"

const Button = {
  baseStyle: {
    fontWeight: "500",
  },
  sizes: {
    md: {
      fontSize: "14px",
    },
    lg: {
      fontSize: "16px",
    },
  },
  variants: {
    solid: (props: StyleFunctionProps) => ({
      backgroundColor: mode("black", "purple")(props),
      color: "white",
    }),
  },
}

export default Button

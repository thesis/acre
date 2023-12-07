import { mode } from "@chakra-ui/theme-tools"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"

const Button = {
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
  },
}

export default Button

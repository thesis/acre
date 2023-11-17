import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import { colors } from "./utils"

const defaultTheme = {
  colors,
  styles: {
    global: (props: StyleFunctionProps) => ({
      "html, body, #root, #root > div": {
        backgroundColor: mode("lightGrey", "darkGrey")(props),
        color: mode("black", "grey.80")(props),
        minHeight: "100vh",
      },
    }),
  },
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

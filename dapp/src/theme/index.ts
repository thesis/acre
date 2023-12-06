import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import { colors } from "./utils"
import { fontSizes, fontWeights, lineHeights } from "./utils/fonts"

const defaultTheme = {
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        backgroundColor: mode("lightGrey", "darkGrey")(props),
        color: mode("black", "grey.80")(props),
      },
    }),
  },
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

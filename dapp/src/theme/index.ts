import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import { colors } from "./utils"

const defaultTheme = {
  colors,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        // TODO: Update when the dark theme is ready
        backgroundColor: mode("gold.300", "gold.300")(props),
        color: mode("grey.700", "grey.700")(props),
      },
    }),
  },
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

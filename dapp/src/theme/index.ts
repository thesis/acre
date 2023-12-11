import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import { colors, fontSizes, fontWeights, lineHeights } from "./utils"
import Card from "./Card"
import Tooltip from "./Tooltip"

const defaultTheme = {
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
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
    Switch,
    Card,
    Tooltip,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

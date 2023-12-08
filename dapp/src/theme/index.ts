import { StyleFunctionProps, Tooltip, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import { colors, fontSizes, fontWeights, lineHeights, zIndices } from "./utils"
import Drawer from "./Drawer"

// Currently, there is no possibility to set all tooltips with hasArrow by defaultProps.
// Let's override the defaultProps as follows.
Tooltip.defaultProps = { ...Tooltip.defaultProps, hasArrow: true }

const defaultTheme = {
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
  zIndices,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        backgroundColor: mode("grey.100", "grey.300")(props),
        color: mode("black", "grey.80")(props),
      },
    }),
  },
  components: {
    Button,
    Switch,
    Drawer,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

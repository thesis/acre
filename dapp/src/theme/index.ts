import { StyleFunctionProps, Tooltip, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import { colors, fonts, lineHeights } from "./utils"
import Heading from "./Heading"

// Currently, there is no possibility to set all tooltips with hasArrow by defaultProps.
// Let's override the defaultProps as follows.
Tooltip.defaultProps = { ...Tooltip.defaultProps, hasArrow: true }

const defaultTheme = {
  colors,
  fonts,
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
    Heading,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

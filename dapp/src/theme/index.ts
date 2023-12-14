import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import { colors, fonts, lineHeights, zIndices } from "./utils"
import Drawer from "./Drawer"
import Modal from "./Modal"
import Card from "./Card"
import Tooltip from "./Tooltip"
import Heading from "./Heading"

const defaultTheme = {
  colors,
  fonts,
  lineHeights,
  zIndices,
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
    Drawer,
    Modal,
    Heading,
    Card,
    Tooltip,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

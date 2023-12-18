import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import Card from "./Card"
import Tooltip from "./Tooltip"
import { colors, fonts, lineHeights } from "./utils"
import Heading from "./Heading"
import CurrencyBalance from "./CurrencyBalance"
import TokenBalanceInput from "./TokenBalanceInput"
import Input from "./Input"

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
    CurrencyBalance,
    Card,
    Tooltip,
    Input,
    TokenBalanceInput,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

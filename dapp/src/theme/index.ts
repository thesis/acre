import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import Button from "./Button"
import Switch from "./Switch"
import { colors, fonts, lineHeights, semanticTokens, zIndices } from "./utils"
import Drawer from "./Drawer"
import Modal from "./Modal"
import Card from "./Card"
import Tooltip from "./Tooltip"
import Heading from "./Heading"
import Sidebar from "./Sidebar"
import CurrencyBalance from "./CurrencyBalance"
import TokenBalanceInput from "./TokenBalanceInput"
import Input from "./Input"
import Stepper from "./Stepper"
import Alert from "./Alert"
import Form from "./Form"
import FormLabel from "./FormLabel"
import FormError from "./FormError"

const defaultTheme = {
  colors,
  fonts,
  lineHeights,
  zIndices,
  semanticTokens,
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
    Sidebar,
    Modal,
    Heading,
    CurrencyBalance,
    Card,
    Tooltip,
    Input,
    TokenBalanceInput,
    Stepper,
    Alert,
    Form,
    FormLabel,
    FormError,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

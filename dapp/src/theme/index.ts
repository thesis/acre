import { extendTheme } from "@chakra-ui/react"
import { buttonTheme } from "./Button"
import {
  colors,
  fonts,
  lineHeights,
  semanticTokens,
  styles,
  zIndices,
} from "./utils"
import { drawerTheme } from "./Drawer"
import { modalTheme } from "./Modal"
import { cardTheme } from "./Card"
import { tooltipTheme } from "./Tooltip"
import { headingTheme } from "./Heading"
import { sidebarTheme } from "./Sidebar"
import { currencyBalanceTheme } from "./CurrencyBalance"
import { tokenBalanceInputTheme } from "./TokenBalanceInput"
import { inputTheme } from "./Input"
import { alertTheme } from "./Alert"
import { formTheme } from "./Form"
import { formLabelTheme } from "./FormLabel"
import { formErrorTheme } from "./FormError"
import { tagTheme } from "./Tag"
import { spinnerTheme } from "./Spinner"
import { linkTheme } from "./Link"
import { skeletonTheme } from "./Skeleton"
import { closeButtonTheme } from "./CloseButton"
import { progressTheme } from "./Progress"
import { countdownTheme } from "./Countdown"

const defaultTheme = {
  // TODO: Remove when dark mode is ready
  // Color mode should be detected by hook useDetectThemeMode
  initialColorMode: "light",
  useSystemColorMode: false,
  colors,
  fonts,
  lineHeights,
  zIndices,
  semanticTokens,
  styles,
  space: {
    13: "3.25rem",
    15: "3.75rem",
    30: "7.5rem",
  },
  components: {
    Alert: alertTheme,
    Button: buttonTheme,
    Card: cardTheme,
    CloseButton: closeButtonTheme,
    CurrencyBalance: currencyBalanceTheme,
    Drawer: drawerTheme,
    Form: formTheme,
    FormLabel: formLabelTheme,
    FormError: formErrorTheme,
    Heading: headingTheme,
    Input: inputTheme,
    Link: linkTheme,
    Modal: modalTheme,
    Sidebar: sidebarTheme,
    Spinner: spinnerTheme,
    Tag: tagTheme,
    TokenBalanceInput: tokenBalanceInputTheme,
    Tooltip: tooltipTheme,
    Skeleton: skeletonTheme,
    Progress: progressTheme,
    Countdown: countdownTheme,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

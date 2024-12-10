import { extendTheme } from "@chakra-ui/react"
import {
  colors,
  fonts,
  lineHeights,
  semanticTokens,
  styles,
  zIndices,
} from "./utils"
import { acreTVLProgressTheme } from "./acreTVLProgressTheme"
import { alertTheme } from "./alertTheme"
import { buttonTheme } from "./buttonTheme"
import { cardTheme } from "./cardTheme"
import { closeButtonTheme } from "./closeButtonTheme"
import { countdownTheme } from "./countdownTheme"
import { currencyBalanceTheme } from "./currencyBalanceTheme"
import { drawerTheme } from "./drawerTheme"
import { footerTheme } from "./footerTheme"
import { formErrorTheme } from "./formErrorTheme"
import { formLabelTheme } from "./formLabelTheme"
import { formTheme } from "./formTheme"
import { headingTheme } from "./headingTheme"
import { inputTheme } from "./inputTheme"
import { linkTheme } from "./linkTheme"
import { modalTheme } from "./modalTheme"
import { progressTheme } from "./progressTheme"
import { skeletonTheme } from "./skeletonTheme"
import { spinnerTheme } from "./spinnerTheme"
import { tagTheme } from "./tagTheme"
import { tokenBalanceInputTheme } from "./tokenBalanceInputTheme"
import { tooltipTheme } from "./tooltipTheme"

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
    Spinner: spinnerTheme,
    Tag: tagTheme,
    TokenBalanceInput: tokenBalanceInputTheme,
    Tooltip: tooltipTheme,
    Skeleton: skeletonTheme,
    Progress: progressTheme,
    Countdown: countdownTheme,
    Footer: footerTheme,
    AcreTVLProgress: acreTVLProgressTheme,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

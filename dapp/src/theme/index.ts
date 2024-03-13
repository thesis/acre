import { StyleFunctionProps, extendTheme } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import { buttonTheme } from "./Button"
import { switchTheme } from "./Switch"
import { colors, fonts, lineHeights, semanticTokens, zIndices } from "./utils"
import { drawerTheme } from "./Drawer"
import { modalTheme } from "./Modal"
import { cardTheme } from "./Card"
import { tooltipTheme } from "./Tooltip"
import { headingTheme } from "./Heading"
import { sidebarTheme } from "./Sidebar"
import { currencyBalanceTheme } from "./CurrencyBalance"
import { tokenBalanceInputTheme } from "./TokenBalanceInput"
import { inputTheme } from "./Input"
import { stepperTheme } from "./Stepper"
import { alertTheme } from "./Alert"
import { formTheme } from "./Form"
import { formLabelTheme } from "./FormLabel"
import { formErrorTheme } from "./FormError"
import { tabsTheme } from "./Tabs"
import { tagTheme } from "./Tag"
import { spinnerTheme } from "./Spinner"
import { tableTheme } from "./Table"
import { currencyIconTheme } from "./CurrencyIcon"
import { statusInfoTheme } from "./StatusInfo"
import { linkTheme } from "./Link"
import { skeletonTheme } from "./Skeleton"
import { closeButtonTheme } from "./CloseButton"

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
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        "--toast-z-index": 1410,
        "#chakra-toast-manager-top": {
          marginTop: "toast_container_shift !important",
        },
        // TODO: Update when the dark theme is ready
        backgroundColor: mode("gold.300", "gold.300")(props),
        color: mode("grey.700", "grey.700")(props),
      },
    }),
  },
  components: {
    Alert: alertTheme,
    Button: buttonTheme,
    Card: cardTheme,
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
    Stepper: stepperTheme,
    Switch: switchTheme,
    Tabs: tabsTheme,
    Tag: tagTheme,
    TokenBalanceInput: tokenBalanceInputTheme,
    Tooltip: tooltipTheme,
    Table: tableTheme,
    CurrencyIcon: currencyIconTheme,
    StatusInfo: statusInfoTheme,
    Skeleton: skeletonTheme,
    CloseButton: closeButtonTheme,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

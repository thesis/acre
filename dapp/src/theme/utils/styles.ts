import { StyleFunctionProps, defineStyle } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"
import { semanticTokens } from "./semanticTokens"
import { zIndices } from "./zIndices"

const bodyStyle = defineStyle((props: StyleFunctionProps) => ({
  // TODO: Update when the dark theme is ready
  backgroundColor: mode("gold.300", "gold.300")(props),
  color: mode("grey.700", "grey.700")(props),
}))

const toastManagerStyle = defineStyle({
  marginTop: `${semanticTokens.space.toast_container_shift} !important`,
  // To set the correct z-index value for the toast component,
  // we need to override it in the global styles
  // More info:
  // https://github.com/chakra-ui/chakra-ui/issues/7505
  zIndex: `${zIndices.toast} !important`,
})

const globalStyle = (props: StyleFunctionProps) => ({
  "#chakra-toast-manager-top": toastManagerStyle,
  body: bodyStyle(props),
})

export const styles = {
  global: (props: StyleFunctionProps) => globalStyle(props),
}

import { StyleFunctionProps, defineStyle } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

const bodyStyle = defineStyle((props: StyleFunctionProps) => ({
  // TODO: Update when the dark theme is ready
  backgroundColor: mode("gold.300", "gold.300")(props),
  color: mode("grey.700", "grey.700")(props),
}))

const globalStyle = (props: StyleFunctionProps) => ({
  body: bodyStyle(props),
})

export const styles = {
  global: (props: StyleFunctionProps) => globalStyle(props),
}

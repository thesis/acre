import { StyleFunctionProps, defineStyle } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools"

const bodyStyle = defineStyle((props: StyleFunctionProps) => ({
  // TODO: Update when the dark theme is ready
  backgroundColor: mode("surface.4", "surface.4")(props),
  color: mode("text.primary", "text.primary")(props),
}))

const globalStyle = (props: StyleFunctionProps) => ({
  body: bodyStyle(props),
})

export default {
  global: (props: StyleFunctionProps) => globalStyle(props),
}

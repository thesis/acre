import { extendTheme } from "@chakra-ui/react"
import Button from "./Button"
import { colors } from "./utils/index"

export const defaultTheme = {
  colors,
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme
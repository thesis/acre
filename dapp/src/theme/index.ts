import { extendTheme } from "@chakra-ui/react"
import Button from "./Button"
import { colors } from "./utils"

const defaultTheme = {
  colors,
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

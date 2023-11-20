import { extendTheme } from "@chakra-ui/react"
import Button from "./Button"
import { colors } from "./utils"
import { fonts } from "./utils/fonts"

const defaultTheme = {
  fonts,
  colors,
  components: {
    Button,
  },
}

const theme = extendTheme(defaultTheme)

export default theme

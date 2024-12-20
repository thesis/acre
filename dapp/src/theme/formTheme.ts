import { formAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const baseStyleHelperText = defineStyle({
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontWeight: "medium",
  color: "text.tertiary",
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  helperText: baseStyleHelperText,
})

export default multiStyleConfig.defineMultiStyleConfig({ baseStyle })

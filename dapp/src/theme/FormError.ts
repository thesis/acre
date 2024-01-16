import { defineStyle, createMultiStyleConfigHelpers } from "@chakra-ui/react"

import { formErrorAnatomy as parts } from "@chakra-ui/anatomy"

const baseStyleText = defineStyle({
  fontWeight: "medium",
  color: "red.400",
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  text: baseStyleText,
})

const FormError = multiStyleConfig.defineMultiStyleConfig({ baseStyle })

export default FormError

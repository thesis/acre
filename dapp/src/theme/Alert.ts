import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import { StyleFunctionProps } from "@chakra-ui/react"
import { createMultiStyleConfigHelpers, cssVar } from "@chakra-ui/styled-system"

const multyStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const $foregroundColor = cssVar("alert-fg")
const $borderColor = cssVar("alert-border-color")

const baseStyle = multyStyleConfig.definePartsStyle({
  container: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: $borderColor.reference,
    p: 5,
    rounded: "xl",
  },
  description: {
    fontWeight: "medium",
  },
  icon: {
    marginEnd: 4,
    boxSize: 6,
    strokeWidth: 1.5,
  },
})

const getForegroundColor = (props: StyleFunctionProps) => {
  const { colorScheme: c } = props
  return `colors.${c}.400`
}

const getBorderColor = (props: StyleFunctionProps) => {
  const { colorScheme: c } = props
  return `colors.${c}.200`
}

const variantSubtle = multyStyleConfig.definePartsStyle((props) => {
  const foregroundColor = getForegroundColor(props)
  const borderColor = getBorderColor(props)
  return {
    container: {
      [$borderColor.variable]: borderColor,
      [$foregroundColor.variable]: foregroundColor,
    },
  }
})

const variants = {
  subtle: variantSubtle,
}

export const alertTheme = multyStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import { StyleFunctionProps } from "@chakra-ui/react"
import { createMultiStyleConfigHelpers, cssVar } from "@chakra-ui/styled-system"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const $foregroundColor = cssVar("alert-fg")
const $borderColor = cssVar("alert-border-color")

const baseStyle = multiStyleConfig.definePartsStyle({
  container: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: $borderColor.reference,
    px: 5,
    py: 5,
    rounded: "xl",
  },
  description: {
    fontWeight: "medium",
    textAlign: "start",
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

const variantSubtle = multiStyleConfig.definePartsStyle((props) => {
  const foregroundColor = getForegroundColor(props)
  const borderColor = getBorderColor(props)
  return {
    container: {
      [$borderColor.variable]: borderColor,
      [$foregroundColor.variable]: foregroundColor,
    },
  }
})

const processVariant = multiStyleConfig.definePartsStyle({
  container: {
    px: 6,
    py: 4,
    bg: "gold.300",
    borderWidth: 1,
    borderColor: "gold.100",
    alignItems: "flex-start",
    [$foregroundColor.variable]: "colors.brand.400",
  },
  icon: {
    mr: 4,
    boxSize: 12,
  },
  title: {
    color: "grey.700",
    fontWeight: "bold",
    m: 0,
  },
  description: { color: "grey.500", fontWeight: "medium" },
})

const variants = {
  subtle: variantSubtle,
  process: processVariant,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

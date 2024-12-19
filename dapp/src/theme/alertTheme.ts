import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, cssVar } from "@chakra-ui/styled-system"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const $backgroundColor = cssVar("alert-bg")
const $foregroundColor = cssVar("alert-fg")
const $borderColor = cssVar("alert-border-color")

const baseStyle = multiStyleConfig.definePartsStyle({
  container: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: $borderColor.reference,
    p: 4,
    rounded: "xl",
  },
  title: {
    fontWeight: "semibold",
    mr: 0,
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

const getColorLevel = (colorScheme: string, level: number) =>
  `colors.${colorScheme}.${level}`

const variantSubtle = multiStyleConfig.definePartsStyle(({ colorScheme }) => {
  const foregroundColor = getColorLevel(colorScheme, 400)
  const borderColor = getColorLevel(colorScheme, 200)
  return {
    container: {
      [$borderColor.variable]: borderColor,
      [$foregroundColor.variable]: foregroundColor,
    },
  }
})

const variantElevated = multiStyleConfig.definePartsStyle(({ colorScheme }) => {
  const backgroundColor = getColorLevel(colorScheme, 200)
  const foregroundColor = getColorLevel("oldPalette.grey", 700)

  return {
    container: {
      [$backgroundColor.variable]: backgroundColor,
      [$foregroundColor.variable]: foregroundColor,
      border: "none",
    },
  }
})

const variants = {
  subtle: variantSubtle,
  elevated: variantElevated,
}

export default multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

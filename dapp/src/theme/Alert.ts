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
  const foregroundColor = getColorLevel("grey", 700)

  return {
    container: {
      [$backgroundColor.variable]: backgroundColor,
      [$foregroundColor.variable]: foregroundColor,
      border: "none",
    },
  }
})

const variantProcess = multiStyleConfig.definePartsStyle({
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
  process: variantProcess,
  elevated: variantElevated,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

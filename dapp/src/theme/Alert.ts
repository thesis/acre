import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

// Base styles

const baseContainerStyles = defineStyle({
  px: 5,
  borderRadius: "xl",
  textAlign: "left",
  color: "white",
  width: "lg",
  boxShadow: "0px 8px 12px 0px var(--chakra-colors-opacity-black-15)",
})

const baseIconStyles = defineStyle({
  mr: 2,
})

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseContainerStyles,
  icon: baseIconStyles,
})

// Status styles

const statusInfo = multiStyleConfig.definePartsStyle({
  container: {
    bg: "blue.500",
  },
  icon: {
    color: "white",
  },
})

const statusError = multiStyleConfig.definePartsStyle({
  container: {
    bg: "red.400",
  },
  icon: {
    color: "white",
  },
})

const statusStyles = (props: StyleFunctionProps) => {
  const { status } = props

  const styleMap: {
    [status: string]: Record<string, SystemStyleInterpolation>
  } = {
    info: statusInfo,
    error: statusError,
  }

  return styleMap[status as string] || {}
}

// Subtle variant styles

const variantSubtle = multiStyleConfig.definePartsStyle((props) =>
  statusStyles(props),
)

// Process variant styles

const processContainerStyles = defineStyle({
  px: 6,
  py: 4,
  bg: "gold.300",
  borderWidth: 1,
  borderColor: "gold.100",
  shadow: "none",
})

const processIconStyles = defineStyle({
  mr: 4,
  w: 12,
  h: 12,
})

const processTitleStyles = defineStyle({
  color: "grey.700",
  fontWeight: "bold",
  m: 0,
})

const processDescriptionStyles = defineStyle({
  color: "grey.500",
  fontWeight: "medium",
})

const processVariant = multiStyleConfig.definePartsStyle({
  container: processContainerStyles,
  icon: processIconStyles,
  title: processTitleStyles,
  description: processDescriptionStyles,
})

// Theme definition

const variants = {
  subtle: variantSubtle,
  process: processVariant,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

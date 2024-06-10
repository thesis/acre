import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  PartsStyleObject,
  StyleFunctionProps,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

// Base styles

const baseContainerStyles = defineStyle({
  px: 5,
  borderRadius: "xl",
  textAlign: "left",
  color: "grey.700",
})

const baseIconStyles = defineStyle({
  mr: 5,
})

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseContainerStyles,
  icon: baseIconStyles,
})

// Status styles

const statusInfo = multiStyleConfig.definePartsStyle({
  container: {
    bg: "gold.200",
    borderColor: "white",
  },
  icon: {
    color: "grey.700",
  },
})

const statusError = multiStyleConfig.definePartsStyle({
  container: {
    bg: "red.100",
    borderColor: "red.200",
  },
  icon: {
    color: "red.400",
  },
})

const statusStyles = (props: StyleFunctionProps): PartsStyleObject => {
  const { status } = props

  const stylesMap = {
    info: statusInfo,
    error: statusError,
  }

  return stylesMap[status as keyof typeof stylesMap]
}

// Subtle variant styles

const subtleVariant = multiStyleConfig.definePartsStyle((props) => {
  const styles = statusStyles(props)

  if (styles.container) {
    styles.container.borderWidth = 1
  }

  return styles
})

// Solid variant styles

const solidVariant = multiStyleConfig.definePartsStyle((props) => {
  const styles = statusStyles(props)

  if (styles.container) {
    styles.container.backgroundColor = styles.container.borderColor
    delete styles.container?.borderColor
    delete styles.container?.borderWidth
  }

  return styles
})

// Loading variant styles

const loadingContainerStyles = defineStyle({
  px: 6,
  py: 4,
  bg: "gold.300",
  borderWidth: 1,
  borderColor: "gold.100",
  alignItems: "flex-start",
})

const loadingIconStyles = defineStyle({
  mr: 4,
  w: 12,
  h: 12,
})

const loadingTitleStyles = defineStyle({
  color: "grey.700",
  fontWeight: "bold",
  m: 0,
})

const loadingDescriptionStyles = defineStyle({
  color: "grey.500",
  fontWeight: "medium",
})

const loadingVariant = multiStyleConfig.definePartsStyle({
  container: loadingContainerStyles,
  icon: loadingIconStyles,
  title: loadingTitleStyles,
  description: loadingDescriptionStyles,
})

// Theme definition

const variants = {
  subtle: subtleVariant,
  loading: loadingVariant,
  solid: solidVariant,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

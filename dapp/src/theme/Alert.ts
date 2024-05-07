import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const baseStyleDialog = defineStyle({
  px: 5,
  borderRadius: "xl",
  textAlign: "left",
  color: "white",
  width: "lg",
  boxShadow: "0px 8px 12px 0px var(--chakra-colors-opacity-black-15)",
})

const baseStyleIcon = defineStyle({
  mr: 2,
})

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const baseStyle = multiStyleConfig.definePartsStyle({
  container: baseStyleDialog,
  icon: baseStyleIcon,
})

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

const variantSubtle = multiStyleConfig.definePartsStyle((props) =>
  statusStyles(props),
)

const processVariant = multiStyleConfig.definePartsStyle(() => ({
  container: {
    px: 6,
    py: 4,
    bg: "gold.300",
    borderWidth: 1,
    borderColor: "gold.100",
    shadow: "none",
  },
  icon: {
    mr: 4,
    w: 12,
    h: 12,
  },
  title: {
    color: "grey.700",
    fontWeight: "bold",
    m: 0,
  },
  description: {
    color: "grey.500",
    fontWeight: "medium",
  },
}))

const variants = {
  subtle: variantSubtle,
  process: processVariant,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

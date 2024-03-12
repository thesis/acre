import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const baseStyleDialog = defineStyle({
  p: 5,
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

const variants = {
  subtle: variantSubtle,
}

export const alertTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  variants,
})

import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleDialog = defineStyle({
  py: 5,
  pl: 5,
  pr: 10,
  border: "2px",
  borderColor: "white",
  borderRadius: "xl",
  textAlign: "left",
  color: "grey.700",
})

const baseStyleIcon = defineStyle({
  mr: 4,
})

const baseStyle = definePartsStyle({
  container: baseStyleDialog,
  icon: baseStyleIcon,
})

const statusInfo = definePartsStyle({
  container: {
    bg: "gold.200",
  },
  icon: {
    color: "grey.700",
  },
})

const statusStyles = (props: StyleFunctionProps) => {
  const { status } = props

  const styleMap: {
    [status: string]: Record<string, SystemStyleInterpolation>
  } = {
    info: statusInfo,
  }

  return styleMap[status] || {}
}

const variantSubtle = definePartsStyle((props) => statusStyles(props))

const variants = {
  subtle: variantSubtle,
}

const Alert = defineMultiStyleConfig({ baseStyle, variants })

export default Alert

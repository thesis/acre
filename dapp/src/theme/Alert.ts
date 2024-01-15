import { alertAnatomy as parts } from "@chakra-ui/anatomy"
import {
  StyleFunctionProps,
  SystemStyleInterpolation,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const KEYS = [...parts.keys, "rightIconContainer"] as const

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(KEYS)

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

const baseStyleRightIconContainer = defineStyle({
  position: "absolute",
  right: 0,
  top: 0,
  p: 5,
  h: "100%",
  borderLeft: "2px solid white",
  color: "brand.400",
  display: "flex",
  alignItems: "center",
  w: 14,
})

const baseStyle = definePartsStyle({
  container: baseStyleDialog,
  icon: baseStyleIcon,
  rightIconContainer: baseStyleRightIconContainer,
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

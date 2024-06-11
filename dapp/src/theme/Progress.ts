import { progressAnatomy as parts } from "@chakra-ui/anatomy"
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/styled-system"
import { getColorVar } from "@chakra-ui/theme-tools"
import { keyframes } from "@chakra-ui/react"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const filledStyle = defineStyle((props) => {
  const { colorScheme: color, theme, isIndeterminate, hasStripe } = props

  const bgColor = `${color}.400`
  const stripeColor = "rgba(255, 255, 255, 0.1)"
  const stripesAnimation = keyframes`
    from { background-position: 0 0; }
    to { background-position: 1rem 0; }
  `

  const addStripe = (!isIndeterminate && hasStripe) as boolean
  const stripeStyle = addStripe && {
    bgColor,
    bgImage: `repeating-linear-gradient(
      105deg,
      transparent 0%,
      transparent 25%,
      ${stripeColor} 25%,
      ${stripeColor} 50%
    )`,
    bgSize: "16.64px 58.05px", // Calculated for 8px stripes
    animation: `${stripesAnimation} 2s linear infinite`,
  }

  const indeterminateStyle = isIndeterminate
    ? {
        bgImage: `linear-gradient(
          to right,
          transparent 0%,
          ${getColorVar(theme, bgColor)} 50%,
          transparent 100%
        )`,
      }
    : { bgColor }

  return {
    ...stripeStyle,
    ...indeterminateStyle,
  }
})

const baseStyleLabel = defineStyle({
  color: "gold.200",
  display: "flex",
  justifyContent: "space-between",
})

const baseStyleTrack = defineStyle({
  bg: "grey.700",
  rounded: "full",
  w: "full",
})

const baseStyleFilledTrack = defineStyle((props) => ({
  ...filledStyle(props),
  rounded: "inherit",
}))

const baseStyle = multiStyleConfig.definePartsStyle((props) => ({
  label: baseStyleLabel,
  filledTrack: baseStyleFilledTrack(props),
  track: baseStyleTrack,
}))

const sizes = {
  xl: multiStyleConfig.definePartsStyle({
    track: { h: 10, p: 1 },
    label: { fontSize: "1.125em", lineHeight: 6, px: 3 },
  }),
  "2xl": multiStyleConfig.definePartsStyle({
    track: { h: 20, p: 2 },
    label: { fontSize: "4xl", lineHeight: "4xl", px: 6 },
  }),
}

export const progressTheme = multiStyleConfig.defineMultiStyleConfig({
  sizes,
  baseStyle,
  defaultProps: {
    size: "xl",
    colorScheme: "brand",
  },
})
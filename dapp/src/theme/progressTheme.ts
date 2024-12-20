import { progressAnatomy as parts } from "@chakra-ui/anatomy"
import {
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/styled-system"
import { getColorVar } from "@chakra-ui/theme-tools"
import { keyframes } from "@chakra-ui/react"

const PROGRESS_TRACK_BG_COLOR = "#3A3328"
const PROGRESS_TRACK_BG_COLOR_PRIMARY = "red.50"
const PROGRESS_TRACK_BG_COLOR_SECONDARY = "#FF8A02"

const multiStyleConfig = createMultiStyleConfigHelpers(parts.keys)

const trackStyle = defineStyle((props) => {
  const { isIndeterminate, hasStripe } = props

  const bgColor = PROGRESS_TRACK_BG_COLOR
  const stripeColor = getColorVar(props.theme, "brown.100") as string
  const stripesAnimation = keyframes`
    from { background-position: 0 0; }
    to { background-position: 17px 0; }
  `

  const addStripe = Boolean(!isIndeterminate && hasStripe)
  const style = {
    bgColor,
    bgImage: `repeating-linear-gradient(
      125deg, 
      ${stripeColor}, 
      ${stripeColor} 2px, 
      ${bgColor} 2px, 
      ${bgColor} 14px
    )`,
    bgSize: "17px 33px", // Calculated for 8px stripes
    animation: `${stripesAnimation} 2s linear infinite`,
  }

  return addStripe ? style : {}
})

const indeterminateStyle = defineStyle((props) => {
  const { theme, isIndeterminate } = props

  const bgColorPrimary = PROGRESS_TRACK_BG_COLOR_PRIMARY
  const bgColorSecondary = PROGRESS_TRACK_BG_COLOR_SECONDARY

  if (!isIndeterminate) {
    return {
      bgGradient: `linear(to-r, ${bgColorPrimary}, ${bgColorSecondary})`,
    }
  }

  return {
    bgImage: `linear-gradient(
          to right,
          transparent 0%,
          ${getColorVar(theme, bgColorPrimary)} 25%,
          ${getColorVar(theme, bgColorSecondary)} 75%,
          transparent 100%
        )`,
  }
})

const baseStyleLabel = defineStyle({
  color: "surface.3",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
})

const baseStyleTrack = defineStyle((props) => ({
  ...trackStyle(props),
  rounded: "full",
  w: "full",
}))

const baseStyleFilledTrack = defineStyle((props) => ({
  ...indeterminateStyle(props),
  rounded: "inherit",
  bgSize: "100%",
}))

const baseStyle = multiStyleConfig.definePartsStyle((props) => ({
  label: baseStyleLabel,
  filledTrack: baseStyleFilledTrack(props),
  track: baseStyleTrack(props),
}))

const sizes = {
  lg: multiStyleConfig.definePartsStyle({
    track: { h: 4 },
    label: { fontSize: "sm", lineHeight: "sm", px: 1.5 },
  }),
  xl: multiStyleConfig.definePartsStyle({
    track: { h: 8 },
    label: { fontSize: "xl", lineHeight: "xl", px: 3 },
  }),
  "2xl": multiStyleConfig.definePartsStyle({
    track: { h: 16 },
    label: { fontSize: "4xl", lineHeight: "4xl", px: 6 },
  }),
}

export default multiStyleConfig.defineMultiStyleConfig({
  sizes,
  baseStyle,
  defaultProps: {
    size: "lg",
  },
})

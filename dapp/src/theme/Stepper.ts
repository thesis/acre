import { stepperAnatomy as parts } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyleStepper = defineStyle({
  _vertical: {
    gap: 0,
  },
})

const baseStyleStep = defineStyle({
  gap: 6,
})

const baseStyleTitle = defineStyle({
  color: "grey.700",
  fontWeight: "bold",
})

const baseStyleDescription = defineStyle({
  color: "grey.600",
  fontWeight: "medium",
})

const baseStyleIndicator = defineStyle(({ colorScheme }) => ({
  borderRadius: 4,
  border: "none",
  fontWeight: "bold",

  "&[data-status=active]": {
    color: "white",
    bg: "brand.400",
  },

  "&[data-status=complete]": {
    color: "white",
    bg: colorScheme === "green" ? "green.300" : "brand.400",
  },
  "&[data-status=incomplete]": {
    color: "grey.700",
    bg: "gold.400",
  },
}))

const baseStyleSeparator = defineStyle(({ colorScheme }) => ({
  _vertical: {
    width: "1px",
  },
  _horizontal: {
    height: "1px",
  },

  "&[data-status=active]": {
    bg: "gold.400",
  },

  "&[data-status=complete]": {
    bg: colorScheme === "green" ? "green.300" : "brand.400",
  },
  "&[data-status=incomplete]": {
    bg: "gold.400",
  },
}))

const baseStyle = definePartsStyle((props) => ({
  stepper: baseStyleStepper,
  step: baseStyleStep,
  title: baseStyleTitle,
  description: baseStyleDescription,
  indicator: baseStyleIndicator(props),
  separator: baseStyleSeparator(props),
}))

export const stepperTheme = defineMultiStyleConfig({ baseStyle })

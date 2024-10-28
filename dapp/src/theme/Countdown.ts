import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["container", "unit", "separator"]

const containerBaseStyle = defineStyle({
  fontWeight: "bold",
  textAlign: "center",
})

const unitBaseStyle = defineStyle({
  display: "inline-block",
  color: "grey.700",
  whiteSpace: "nowrap",
})

const separatorBaseStyle = defineStyle({
  display: "inline-block",
  color: "grey.300",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle(() => ({
  container: containerBaseStyle,
  unit: unitBaseStyle,
  separator: separatorBaseStyle,
}))

const getSizeStyles = (size: string) => ({
  unit: {
    w: "1.25em", // based on size proportions
    fontSize: size,
    lineHeight: size,
  },
  separator: {
    w: "0.3125em", // based on size proportions
    fontSize: size,
    lineHeight: size,
  },
})

const sizes = Object.fromEntries(
  ["xs", "sm", "md", "lg", "xl", "2xl"].map((size) => [
    size,
    getSizeStyles(size),
  ]),
)

export const countdownTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
  sizes,
})

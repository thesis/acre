import {
  StyleFunctionProps,
  createMultiStyleConfigHelpers,
  defineStyle,
} from "@chakra-ui/react"

const PARTS = ["container", "label"]

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyleContainer = defineStyle(({ colorScheme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: 2,
  ...(colorScheme === "green" && { color: "green.600" }),
  ...(colorScheme === "blue" && { color: "blue.600" }),
  ...(colorScheme === "brand" && { color: "brand.400" }),
}))

const baseStyleLabel = defineStyle({
  fontWeight: "semibold",
  fontSize: "sm",
  lineHeight: "sm",
})

const baseStyle = multiStyleConfig.definePartsStyle(
  (props: StyleFunctionProps) => ({
    container: baseStyleContainer(props),
    label: baseStyleLabel,
  }),
)

export const statusInfoTheme = multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

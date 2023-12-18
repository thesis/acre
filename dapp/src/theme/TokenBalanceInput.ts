import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = [
  "container",
  "labelContainer",
  "label",
  "balance",
  "helperText",
  "errorMsgText",
]

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(PARTS)

const baseStyleContainer = defineStyle({
  display: "flex",
  flexDirection: "column",
  gap: 1,
})

const baseStyleLabelContainer = defineStyle({
  display: "flex",
  justifyContent: "space-between",
})

const baseStyleLabel = defineStyle({
  fontWeight: "semibold",
})

const baseStyleBalance = defineStyle({
  fontWeight: "medium",
  color: "grey.500",
})

const baseStyleHelperText = defineStyle({
  fontWeight: "medium",
  color: "grey.500",
})

const baseStyleErrorMsgText = defineStyle({
  fontWeight: "medium",
  color: "red.400",
})

const baseStyle = definePartsStyle({
  container: baseStyleContainer,
  labelContainer: baseStyleLabelContainer,
  label: baseStyleLabel,
  balance: baseStyleBalance,
  helperText: baseStyleHelperText,
  errorMsgText: baseStyleErrorMsgText,
})

const sizeMd = definePartsStyle({
  label: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  balance: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  helperText: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  errorMsgText: {
    fontSize: "sm",
    lineHeight: "sm",
  },
})

const sizeLg = definePartsStyle({
  label: {
    fontSize: "md",
    lineHeight: "md",
  },
  balance: {
    fontSize: "md",
    lineHeight: "md",
  },
  helperText: {
    fontSize: "sm",
    lineHeight: "sm",
  },
  errorMsgText: {
    fontSize: "sm",
    lineHeight: "sm",
  },
})

const sizes = {
  md: sizeMd,
  lg: sizeLg,
}

const TokenBalanceInput = defineMultiStyleConfig({ baseStyle, sizes })

export default TokenBalanceInput

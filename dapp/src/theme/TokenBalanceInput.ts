import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["labelContainer", "balanceContainer", "balance"]

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(PARTS)

const baseStyleLabelContainer = defineStyle({
  display: "flex",
  justifyContent: "space-between",
})

const baseStyleBalanceContainer = defineStyle({
  display: "flex",
  gap: 1,
})

const baseStyleBalance = defineStyle({
  fontWeight: "medium",
  color: "grey.500",
})

const baseStyle = definePartsStyle({
  labelContainer: baseStyleLabelContainer,
  balanceContainer: baseStyleBalanceContainer,
  balance: baseStyleBalance,
})

export const tokenBalanceInputTheme = defineMultiStyleConfig({ baseStyle })

import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react"

const PARTS = ["labelContainer", "balanceContainer", "balance"]

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
  color: "text.tertiary",
})

const multiStyleConfig = createMultiStyleConfigHelpers(PARTS)

const baseStyle = multiStyleConfig.definePartsStyle({
  labelContainer: baseStyleLabelContainer,
  balanceContainer: baseStyleBalanceContainer,
  balance: baseStyleBalance,
})

export default multiStyleConfig.defineMultiStyleConfig({
  baseStyle,
})

import React, { ComponentProps } from "react"
import { Box } from "@chakra-ui/react"
import TransactionDetailsItem, { TransactionDetailsItemProps } from "."
import { CurrencyBalanceWithConversion } from "../CurrencyBalanceWithConversion"

type TransactionDetailsAmountItemProps = ComponentProps<
  typeof CurrencyBalanceWithConversion
> &
  Pick<TransactionDetailsItemProps, "label">

function TransactionDetailsAmountItem({
  label,
  from,
  to,
}: TransactionDetailsAmountItemProps) {
  return (
    <TransactionDetailsItem label={label} alignItems="start">
      <Box>
        <CurrencyBalanceWithConversion
          from={{
            size: "md",
            ...from,
          }}
          to={{
            size: "sm",
            fontWeight: "medium",
            color: "grey.500",
            ...to,
          }}
        />
      </Box>
    </TransactionDetailsItem>
  )
}

export default TransactionDetailsAmountItem

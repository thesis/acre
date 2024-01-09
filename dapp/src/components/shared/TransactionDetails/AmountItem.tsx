import React, { ComponentProps } from "react"
import { Flex } from "@chakra-ui/react"
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
      <Flex flexDirection="column" alignItems="end">
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
      </Flex>
    </TransactionDetailsItem>
  )
}

export default TransactionDetailsAmountItem

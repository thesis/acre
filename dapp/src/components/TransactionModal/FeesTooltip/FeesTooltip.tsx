import React from "react"
import { Info } from "#/assets/icons"
import { Icon, Tooltip, List } from "@chakra-ui/react"
import { FeesItemType, FeesTooltipItem } from "./FeesTooltipItem"

const fees: Array<FeesItemType> = [
  {
    label: "Acre protocol fees",
    amount: "100000",
    currency: "bitcoin",
  },
  {
    label: "tBTC bridge fees",
    amount: "240000",
    currency: "bitcoin",
  },
  {
    label: "Bitcoin network fees",
    amount: "200000",
    currency: "bitcoin",
  },
]

export function FeesTooltip() {
  return (
    <Tooltip
      placement="right"
      label={
        <List spacing={0.5} minW={60}>
          {fees.map((fee) => (
            <FeesTooltipItem
              key={fee.label}
              label={fee.label}
              amount={fee.amount}
              currency={fee.currency}
            />
          ))}
        </List>
      }
    >
      <Icon as={Info} ml={2} boxSize={4} cursor="pointer" color="grey.400" />
    </Tooltip>
  )
}

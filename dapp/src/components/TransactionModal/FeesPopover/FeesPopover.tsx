import React from "react"
import { Info } from "#/assets/icons"
import { Icon, VStack, Tooltip } from "@chakra-ui/react"
import { FeesItemType, FeesPopoverItem } from "./FeesPopoverItem"

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

export function FeesPopover() {
  return (
    <Tooltip
      placement="right"
      label={
        <VStack gap={0.5}>
          {fees.map((fee) => (
            <FeesPopoverItem
              label={fee.label}
              amount={fee.amount}
              currency={fee.currency}
            />
          ))}
        </VStack>
      }
    >
      <Icon as={Info} ml={2} boxSize={5} cursor="pointer" color="grey.400" />
    </Tooltip>
  )
}

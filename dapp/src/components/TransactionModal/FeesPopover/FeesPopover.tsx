import React from "react"
import { Info } from "#/assets/icons"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Icon,
  VStack,
} from "@chakra-ui/react"
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
    <Popover isLazy placement="right">
      <PopoverTrigger>
        <Icon as={Info} ml={2} boxSize={5} cursor="pointer" color="grey.400" />
      </PopoverTrigger>
      <PopoverContent
        color="white"
        bg="grey.700"
        borderWidth="0"
        borderRadius="xl"
        w={72}
      >
        <PopoverArrow bg="grey.700" />
        <PopoverBody p={3}>
          <VStack gap={0.5}>
            {fees.map((fee) => (
              <FeesPopoverItem
                label={fee.label}
                amount={fee.amount}
                currency={fee.currency}
              />
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

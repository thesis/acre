import React from "react"
import { Text } from "@chakra-ui/react"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import HighlightedValueCard from "./HighlightedValueCard"

export default function TVLCard() {
  return (
    <HighlightedValueCard
      header="Total value locked"
      value={{
        amount: "2202.92",
        currency: "usd",
        shouldBeFormatted: false,
      }}
      color="brand.400"
      footer={[
        <HighlightedValueCard.FooterItem>
          <Text as="span" color="green.400" mr={2}>
            +2%
          </Text>
          +24h
        </HighlightedValueCard.FooterItem>,
        <HighlightedValueCard.FooterItem>
          <CurrencyBalance
            amount="27202964.47"
            currency="usd"
            shouldBeFormatted={false}
            fontWeight="unset"
            symbolPosition="prefix"
          />
        </HighlightedValueCard.FooterItem>,
      ]}
    />
  )
}

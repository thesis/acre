import React from "react"
import { Text } from "@chakra-ui/react"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import ValueCard from "./ValueCard"

export default function TVLCard() {
  return (
    <ValueCard
      header="Total value locked"
      value={{
        amount: "2202.92",
        currency: "usd",
        shouldBeFormatted: false,
      }}
      color="brand.400"
      footer={[
        <ValueCard.FooterItem>
          <Text as="span" color="green.400" mr={2}>
            +2%
          </Text>
          +24h
        </ValueCard.FooterItem>,
        <ValueCard.FooterItem>
          <CurrencyBalance
            amount="27202964.47"
            currency="usd"
            shouldBeFormatted={false}
            fontWeight="unset"
            symbolPosition="prefix"
          />
        </ValueCard.FooterItem>,
      ]}
    />
  )
}

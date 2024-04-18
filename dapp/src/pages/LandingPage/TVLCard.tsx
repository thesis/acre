import React from "react"
import { Text } from "@chakra-ui/react"
import ValueCard from "./ValueCard"

export default function TVLCard() {
  return (
    <ValueCard
      header="Total value locked"
      value="2,202.92 BTC"
      color="brand.400"
      footer={[
        <ValueCard.FooterItem>
          <Text as="span" color="green.400" mr={2}>
            +2%
          </Text>
          +24h
        </ValueCard.FooterItem>,
        <ValueCard.FooterItem>USD 27,202,964.47</ValueCard.FooterItem>,
      ]}
    />
  )
}

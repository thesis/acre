import React, { useMemo } from "react"
import { Flex, VStack, HStack, Text } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/card-icon-boost-arrow.png"
import misteryCardIcon from "#/assets/images/card-icon-question-mark.png"
import keyCardIcon from "#/assets/images/card-icon-key.png"
import { useCountdown } from "#/hooks"
import IconCard from "./IconCard"
import ValueCard from "./ValueCard"

const MOCK_SEASON_DUE_TIMESTAMP = new Date(2024, 3, 20).getTime() / 1000

export default function LandingPage() {
  const countdown = useCountdown(MOCK_SEASON_DUE_TIMESTAMP)
  const unlockableDuePeriod = useMemo(
    () =>
      Object.entries(countdown)
        .filter(([label]) => label !== "seconds")
        .reduce(
          (acc, [label, value]) =>
            `${acc} ${value}${label.charAt(0).toLowerCase()}`,
          "",
        )
        .trim(),
    [countdown],
  )

  return (
    <Flex w="full" flexFlow="column" px={10}>
      <VStack spacing={4} mx={32} align="stretch">
        <HStack spacing={5} align="stretch" mb={12} w="full">
          <IconCard
            flex={1}
            header="Rewards Boost"
            body="Platinum Boost"
            icon={{ src: boostCardIcon, maxH: "14.9375rem" }} // 239px
          />
          <IconCard
            flex={1}
            header="Mystery Box"
            body={`Unlockable in ${unlockableDuePeriod}`}
            icon={{ src: misteryCardIcon, maxH: "10.375rem" }} // 166px
          />
          <IconCard
            flex={1}
            header="All Seasons Key"
            body={
              <>
                Grants access to all <br /> upcoming seasons
              </>
            }
            icon={{ src: keyCardIcon, maxH: "8.375rem" }} // 134px
          />
        </HStack>
        <ValueCard header="Users joined" value="8,172" />
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
      </VStack>
    </Flex>
  )
}

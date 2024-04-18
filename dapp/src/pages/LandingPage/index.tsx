import React, { useMemo } from "react"
import { Flex, VStack, HStack, Box, Image } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/card-icon-boost-arrow.png"
import misteryCardIcon from "#/assets/images/card-icon-question-mark.png"
import keyCardIcon from "#/assets/images/card-icon-key.png"
import { useCountdown } from "#/hooks"
import baseLogo from "#/assets/images/partner-logos/base-logo.png"
import thresholdLogo from "#/assets/images/partner-logos/threshold-logo.png"
import ledgerLogo from "#/assets/images/partner-logos/ledger-logo.png"
import wormholeLogo from "#/assets/images/partner-logos/wormhole-logo.png"
import IconCard from "./IconCard"
import ValueCard from "./ValueCard"
import TVLCard from "./TVLCard"
import ContentCard from "./ContentCard"
import CardButton from "./CardButton"

const MOCK_SEASON_DUE_TIMESTAMP = new Date(2024, 3, 20).getTime() / 1000
const PARTNER_LOGOS = [baseLogo, thresholdLogo, ledgerLogo, wormholeLogo]

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
        <TVLCard />
        <ContentCard header="How it works" withBackground>
          <Box color="brand.400" fontWeight="semibold" pt={9} pb={20}>
            inset diagram here
          </Box>
        </ContentCard>
        <ContentCard header="Trusted by pioneers.">
          {PARTNER_LOGOS.map((logoSrc) => (
            <Image
              key={logoSrc}
              src={logoSrc}
              objectFit="contain"
              maxH={10}
              alt="Partner logo"
            />
          ))}
        </ContentCard>
        <CardButton href="#" isExternal>
          Docs
        </CardButton>
        <CardButton href="#" isExternal>
          FAQ
        </CardButton>
      </VStack>
    </Flex>
  )
}

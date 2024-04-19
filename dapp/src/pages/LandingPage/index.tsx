import React from "react"
import { Flex, VStack, HStack, Box, Image } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/card-icon-boost-arrow.png"
import misteryCardIcon from "#/assets/images/card-icon-question-mark.png"
import keyCardIcon from "#/assets/images/card-icon-key.png"
import baseLogo from "#/assets/images/partner-logos/base-logo.png"
import thresholdLogo from "#/assets/images/partner-logos/threshold-logo.png"
import ledgerLogo from "#/assets/images/partner-logos/ledger-logo.png"
import wormholeLogo from "#/assets/images/partner-logos/wormhole-logo.png"
import { EXTERNAL_HREF } from "#/constants"
import IconCard from "./IconCard"
import ValueCard from "./ValueCard"
import TVLCard from "./TVLCard"
import ContentCard from "./ContentCard"
import CardButton from "./CardButton"

const PARTNER_LOGOS = [baseLogo, thresholdLogo, ledgerLogo, wormholeLogo]

export default function LandingPage() {
  return (
    <Flex w="full" flexFlow="column" px={10}>
      <VStack spacing={4} mx={32} align="stretch">
        <HStack spacing={5} align="stretch" mb={12} w="full">
          <IconCard
            flex={1}
            header="Rewards Boost"
            body={
              <>
                Boosts your APY when <br /> Acre fully launches
              </>
            }
            icon={{ src: boostCardIcon, maxH: "14.9375rem" }} // 239px
          />
          <IconCard
            flex={1}
            header="Mystery Box"
            body={
              <>
                Grants you a random <br /> reward gift.
              </>
            }
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
            insert diagram here
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
        <CardButton href={EXTERNAL_HREF.DOCS} isExternal>
          Docs
        </CardButton>
        <CardButton href={EXTERNAL_HREF.FAQ} isExternal>
          FAQ
        </CardButton>
      </VStack>
    </Flex>
  )
}

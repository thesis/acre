import React from "react"
import { Flex, VStack, HStack, Box, Image, ImageProps } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/rewards-boost.svg"
import misteryCardIcon from "#/assets/images/mystery-box.svg"
import keyCardIcon from "#/assets/images/season-key.svg"
import baseLogo from "#/assets/images/partner-logos/base-logo.svg"
import thresholdLogo from "#/assets/images/partner-logos/threshold-logo.svg"
import ledgerLogo from "#/assets/images/partner-logos/ledger-logo.svg"
import wormholeLogo from "#/assets/images/partner-logos/wormhole-logo.svg"
import { EXTERNAL_HREF } from "#/constants"
import IconCard from "./IconCard"
import ValueCard from "./ValueCard"
import TVLCard from "./TVLCard"
import ContentCard from "./ContentCard"
import CardButton from "./CardButton"

const PARTNER_LOGOS: Pick<ImageProps, "src" | "maxW" | "alt">[] = [
  { src: baseLogo, maxW: "5.625rem", alt: "Base logo" }, // 90px
  { src: thresholdLogo, maxW: "13.125rem", alt: "Threshold logo" }, // 210px
  { src: ledgerLogo, maxW: "7.4375rem", alt: "Ledger logo" }, // 119px
  { src: wormholeLogo, maxW: "11.375rem", alt: "Wormhole logo" }, // 182px
]

export default function LandingPage() {
  return (
    <Flex
      w="full"
      flexFlow="column"
      px={10}
      pb={10}
      maxW="100.625rem"
      mx="auto"
    >
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
            icon={{ src: boostCardIcon }}
          />
          <IconCard
            flex={1}
            header="Mystery Box"
            body={
              <>
                Grants you a random <br /> reward gift.
              </>
            }
            icon={{ src: misteryCardIcon }}
          />
          <IconCard
            flex={1}
            header="All Seasons Key"
            body={
              <>
                Grants access to all <br /> upcoming seasons
              </>
            }
            icon={{ src: keyCardIcon }}
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
          {PARTNER_LOGOS.map((logoAttributes) => (
            <Image h="auto" {...logoAttributes} />
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

import React from "react"
import { Flex, VStack, Box, Image } from "@chakra-ui/react"
import boostCardIcon from "#/assets/images/rewards-boost.svg"
import mysteryCardIcon from "#/assets/images/mystery-box.svg"
import keyCardIcon from "#/assets/images/season-key.svg"
import { EXTERNAL_HREF, PARTNER_LOGOS } from "#/constants"
import { TextMd } from "#/components/shared/Typography"
import BenefitCard from "./BenefitCard"
import HighlightedValueCard from "./HighlightedValueCard"
import TVLCard from "./TVLCard"
import ContentCard from "./ContentCard"
import CardButton from "./CardButton"
import HeroSection from "./HeroSection"

export default function LandingPage() {
  return (
    <Flex w="full" flexFlow="column" px={10} pb={10}>
      <HeroSection />
      <VStack
        spacing={4}
        w="full"
        maxW="79.25rem" // 1268px
        mx="auto"
        align="stretch"
      >
        <Flex
          flexDirection={{ base: "column", xl: "row" }}
          gap={5}
          align="stretch"
          mb={12}
          w="full"
        >
          <BenefitCard
            flex={1}
            header="Rewards Boost"
            icon={{ src: boostCardIcon }}
          >
            <TextMd>Boosts your APY when</TextMd>
            <TextMd>Acre fully launches</TextMd>
          </BenefitCard>
          <BenefitCard
            flex={1}
            header="Mystery Box"
            icon={{ src: mysteryCardIcon }}
          >
            <TextMd>Grants you a random</TextMd>
            <TextMd>reward gift.</TextMd>
          </BenefitCard>
          <BenefitCard
            flex={1}
            header="All Seasons Key"
            icon={{ src: keyCardIcon }}
          >
            <TextMd>Grants access to all</TextMd>
            <TextMd>upcoming seasons</TextMd>
          </BenefitCard>
        </Flex>
        <HighlightedValueCard header="Users joined" value="8,172" />
        <TVLCard />
        <ContentCard header="How it works" withBackground>
          <Box color="brand.400" fontWeight="semibold" pt={9} pb={20}>
            {/* TODO: Replace with diagram image/component. */}
            insert diagram here
          </Box>
        </ContentCard>
        <ContentCard header="Trusted by pioneers.">
          {PARTNER_LOGOS.map((logoAttributes) => (
            <Image key={logoAttributes.src} h="auto" {...logoAttributes} />
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

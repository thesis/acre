import React from "react"
import { Flex, VStack, Image } from "@chakra-ui/react"
import { EXTERNAL_HREF, PARTNER_LOGOS } from "#/constants"
import {
  CurrentSeasonSection,
  HeroSection,
  CardButton,
  ContentCard,
} from "#/pages/LandingPage/components"
import MobileModeBanner from "#/components/MobileModeBanner"

export default function LandingPage() {
  return (
    <>
      <MobileModeBanner />
      <Flex w="full" flexFlow="column" px={10} pb={10}>
        <HeroSection />
        <CurrentSeasonSection />
        <VStack
          spacing={4}
          w="full"
          maxW="79.25rem" // 1268px
          px={{ base: 6, xl: 0 }}
          mx="auto"
          align="stretch"
        >
          {/* 
        TODO: Bring back when TVL, user count and/or how-it-works diagram are available

        <HighlightedValueCard header="Users joined">8,172</HighlightedValueCard>
        <TVLCard /> 
        <ContentCard header="How it works" withBackground>
          <Box color="brand.400" fontWeight="semibold" pt={9} pb={20}>
            insert diagram here
          </Box>
        </ContentCard>
          */}
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
    </>
  )
}

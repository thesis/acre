import React from "react"
import { Flex, VStack, Image } from "@chakra-ui/react"
import { BENEFITS, EXTERNAL_HREF, PARTNER_LOGOS } from "#/constants"
import { TextMd } from "#/components/shared/Typography"
import {
  SeasonCountdownSection,
  HeroSection,
  CardButton,
  ContentCard,
  BenefitCard,
} from "#/pages/LandingPage/components"

export default function LandingPage() {
  return (
    <Flex w="full" flexFlow="column" px={10} pb={10}>
      <HeroSection />
      <SeasonCountdownSection />
      <VStack
        spacing={4}
        w="full"
        maxW="79.25rem" // 1268px
        px={{ base: 6, xl: 0 }}
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
          {BENEFITS.map(({ name, description, imageSrc }) => (
            <BenefitCard
              key={name}
              flex={1}
              header={name}
              icon={{ src: imageSrc }}
            >
              <TextMd>{description}</TextMd>
            </BenefitCard>
          ))}
        </Flex>
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
            <Image
              key={logoAttributes.src}
              h="auto"
              userSelect="none"
              pointerEvents="none"
              {...logoAttributes}
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

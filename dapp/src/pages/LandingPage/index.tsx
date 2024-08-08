import React from "react"
import {
  Flex,
  VStack,
  Image,
  Highlight,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react"
import { EXTERNAL_HREF, PARTNER_LOGOS } from "#/constants"
import {
  CurrentSeasonSection,
  HeroSection,
  CardButton,
} from "#/pages/LandingPage/components"
import MobileModeBanner from "#/components/MobileModeBanner"
import { H4 } from "#/components/shared/Typography"

export default function LandingPage() {
  return (
    <>
      <MobileModeBanner />
      <Flex
        w="full"
        flexFlow="column"
        px={{
          base: 4,
          md: 10,
        }}
        pb={10}
      >
        <HeroSection />
        <CurrentSeasonSection />
        <VStack
          spacing={4}
          w="full"
          maxW="landing_page_content_width"
          px={{ base: 0, md: 6, xl: 0 }}
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
          <Card>
            <CardHeader as={H4} textAlign="center" p={10}>
              <Highlight query="pioneers." styles={{ color: "brand.400" }}>
                Trusted by pioneers.
              </Highlight>
            </CardHeader>

            <CardBody
              as={Flex}
              direction={{ base: "column", lg: "row" }}
              gap={12}
              align="center"
              justify="center"
              px={10}
              pt={0}
              pb={8}
            >
              {PARTNER_LOGOS.map((logoAttributes) => (
                <Image key={logoAttributes.src} h="auto" {...logoAttributes} />
              ))}
            </CardBody>
          </Card>

          <CardButton href={EXTERNAL_HREF.DOCS} isExternal>
            Docs
          </CardButton>

          <CardButton href={EXTERNAL_HREF.FAQ} isExternal>
            FAQ
          </CardButton>

          <CardButton href={EXTERNAL_HREF.BLOG} isExternal>
            Blog
          </CardButton>
        </VStack>
      </Flex>
    </>
  )
}

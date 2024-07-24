import React from "react"
import {
  Box,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Image,
} from "@chakra-ui/react"
import ProgressBar from "#/components/shared/ProgressBar"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { H3, TextLg, TextMd, TextXl } from "#/components/shared/Typography"
import { SEASON_CAP } from "#/constants"
import { LiveTag } from "#/components/shared/LiveTag"
import { SeasonSectionBackground } from "#/components/shared/SeasonSectionBackground"
import { useSeasonProgress } from "#/hooks"
import { mezoLogoColor } from "#/assets/images/partner-logos"

export default function CurrentSeasonSection() {
  const { progress: seasonProgress, value: seasonTotalAssets } =
    useSeasonProgress()

  return (
    <Box position="relative" mb={5}>
      <VStack
        spacing={0}
        px={{ base: 6, xl: 0 }}
        pb={8}
        textAlign="center"
        color="grey.700"
      >
        <LiveTag
          mt={-4}
          mb="5.125rem" // 82px
          ring={12}
          ringColor="gold.300"
          position="relative"
          sx={{
            "&::before, &::after": {
              content: "''",
              boxSize: 3.5,
              bgImage:
                "radial-gradient(circle at 100% 100%, transparent 0.875rem, gold.300 0.875rem)",
              position: "absolute",
              top: 4,
              transform: "auto",
            },
          }}
          _before={{
            left: -6,
            rotate: 90,
          }}
          _after={{
            right: -6,
          }}
        />

        <H3 mb={2}>Season 1. Staking is live!</H3>

        <TextLg mb={12}>
          Season 1 stakers will harvest Mezo points and get priority access to
          Bitcoin yield
        </TextLg>

        <TextMd fontWeight="semibold" mb={4}>
          Total value locked
        </TextMd>

        <ProgressBar
          size="2xl"
          value={seasonProgress}
          maxW="50rem" // 800px
        >
          <CurrencyBalance
            amount={seasonTotalAssets}
            currency="bitcoin"
            variant="greater-balance-xl"
            symbolFontWeight="black"
            // TODO: Refactor `CurrencyBalance` to make font styles truely adjustable
          />
        </ProgressBar>

        <TextXl
          display="flex"
          whiteSpace="pre"
          mt={2}
          mb="7.5rem" // 120px
        >
          Season 1 cap{" "}
          <CurrencyBalance
            as="span"
            size="xl"
            amount={SEASON_CAP}
            currency="bitcoin"
          />
        </TextXl>

        {/* TODO: Uncomment in post-launch phases */}
        {/* 
        <Flex
          flexDirection={{ base: "column", xl: "row" }}
          gap={5}
          align="stretch"
          w="full"
          maxW="63rem" // 1008px
          mx="auto"
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
        */}

        <Card p={6} w="full" maxW="landing_page_content_width" mx="auto">
          <CardHeader p={0} mb={6}>
            <TextMd fontWeight="semibold">Season partner</TextMd>
          </CardHeader>
          <CardBody p={0} as={VStack} spacing={6}>
            <Image
              src={mezoLogoColor}
              maxW="16.5rem" // 264px
            />
            <TextMd fontWeight="medium" color="grey.500">
              Mezo is the economic layer for Bitcoin with a mission to activate
              a trillion dollar opportunity.
            </TextMd>
          </CardBody>
        </Card>
      </VStack>

      <SeasonSectionBackground
        pos="absolute"
        top={0}
        left="50%"
        translateX="-50%"
        transform="auto"
        w="full"
        maxW="125rem" // 2000px
        zIndex={-1}
      />
    </Box>
  )
}

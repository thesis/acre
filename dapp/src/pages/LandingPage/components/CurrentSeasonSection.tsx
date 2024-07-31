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
import { H3, TextMd } from "#/components/shared/Typography"
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
        px={{ base: 3, md: 6, xl: 0 }}
        pb={{ base: 6, md: 8 }}
        textAlign="center"
        color="grey.700"
      >
        <LiveTag
          mt={-4}
          mb={{
            base: "2.625rem", // 42px
            md: "5.125rem", // 82px
          }}
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

        <H3
          mb={2}
          letterSpacing="-0.72px" // -2% of font size
          sx={{ textWrap: "balance" }}
        >
          Season 1 staking is live!
        </H3>

        <TextMd
          mb={{
            base: 10,
            md: "5.5rem", // 88px
          }}
          fontWeight="semibold"
          fontSize={{ md: "lg" }}
          lineHeight={{ md: "lg" }}
        >
          Season 1 stakers will soon be able to earn Acre and Mezo points.
        </TextMd>

        {/* TODO: Uncomment when TVL is higher */}
        {/* <TextMd fontWeight="semibold" mb={4}>
          Total value locked
        </TextMd>

        <ProgressBar
          size={{
            base: "xl",
            md: "2xl",
          }}
          value={seasonProgress}
          maxW="50rem" // 800px
        >
          <CurrencyBalance
            amount={seasonTotalAssets}
            currency="bitcoin"
            variant={{
              base: "greater-balance-md",
              md: "greater-balance-xl",
            }}
            symbolFontWeight="black"
            desiredDecimals={2}
            // TODO: Refactor `CurrencyBalance` to make font styles truely adjustable
          />
        </ProgressBar>

        <TextMd
          fontSize={{ md: "xl" }}
          lineHeight={{ md: "xl" }}
          display="flex"
          whiteSpace="pre"
          mt={2}
          mb={{
            base: 10,
            md: "7.5rem", // 120px
          }}
        >
          Season 1 cap{" "}
          <CurrencyBalance
            as="span"
            size={{ base: "", md: "xl" }}
            amount={SEASON_CAP}
            currency="bitcoin"
            desiredDecimals={0}
          />
        </TextMd> */}

        {/* TODO: Uncomment in post-launch phases */}
        {/*  <Flex
          flexDirection={{ base: "column", xl: "row" }}
          gap={{ base: 2, md: 5 }}
          align="stretch"
          maxW="63rem" // 1008px
          mx={{
            base: -1,
            md: "auto",
          }}
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
        </Flex> */}

        <Card p={6} w="full" maxW="landing_page_content_width" mx="auto">
          <CardHeader p={0} mb={6}>
            <TextMd fontWeight="semibold">Season partner</TextMd>
          </CardHeader>
          <CardBody p={0} as={VStack} spacing={6}>
            <Image
              src={mezoLogoColor}
              maxW={{
                base: "8.25rem", // 132px
                md: "16.5rem", // 264px
              }}
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

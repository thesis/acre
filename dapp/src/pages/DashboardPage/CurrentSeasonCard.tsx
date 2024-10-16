import React from "react"
import { StackProps, Flex, VStack, Heading } from "@chakra-ui/react"
import { numberToLocaleString } from "#/utils"
import { TextMd } from "#/components/shared/Typography"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import ProgressBar from "#/components/shared/ProgressBar"
import { SeasonSectionBackground } from "#/components/shared/SeasonSectionBackground"
import { LiveTag } from "#/components/shared/LiveTag"
import { useSeasonProgress } from "#/hooks"

type CurrentSeasonCardProps = StackProps & {
  showSeasonStats?: boolean
}

export function CurrentSeasonCard(props: CurrentSeasonCardProps) {
  const { showSeasonStats = true, ...restProps } = props

  const totalJoined = 3045 // TODO: fetch from API
  const tvl = 144500000000 // TODO: fetch from API
  const { progress: seasonProgress, value: seasonTotalAssets } =
    useSeasonProgress()

  return (
    <VStack
      spacing={4}
      px={4}
      py={6}
      w="full"
      minH="12.5rem" // 200px
      align="stretch"
      position="relative"
      {...restProps}
    >
      <LiveTag fontSize="sm" px={3} py={1} gap={2} />

      <Heading
        as="p"
        color="grey.700"
        fontSize="2xl"
        lineHeight={1}
        letterSpacing="-0.03rem" // -0.48px
        mb="auto"
      >
        Season 1 staking is live!
      </Heading>

      <ProgressBar value={seasonProgress} w="auto">
        <CurrencyBalance
          amount={seasonTotalAssets}
          currency="bitcoin"
          variant="greater-balance-md"
          desiredDecimals={2}
        />
      </ProgressBar>

      {showSeasonStats && (
        <Flex align="baseline" justify="space-between" color="white">
          <TextMd fontWeight="medium">
            Total joined&nbsp;
            <TextMd as="span" fontWeight="bold">
              {numberToLocaleString(totalJoined, 2)}
            </TextMd>
          </TextMd>

          <TextMd display="flex" fontWeight="medium">
            TVL&nbsp;
            <CurrencyBalance
              as="span"
              amount={tvl}
              currency="bitcoin"
              fontSize="md"
              fontWeight="bold"
            />
          </TextMd>
        </Flex>
      )}

      <SeasonSectionBackground position="absolute" inset={0} zIndex={-1} />
    </VStack>
  )
}

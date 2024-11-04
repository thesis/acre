import React from "react"
import {
  StackProps,
  useMultiStyleConfig,
  HStack,
  VStack,
  Grid,
  Box,
} from "@chakra-ui/react"
import { useTVL } from "#/hooks"
import { BitcoinIcon } from "#/assets/icons"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import ProgressBar from "#/components/shared/ProgressBar"
import { TextMd, TextXs } from "#/components/shared/Typography"
import { TOTAL_VALUE_LOCKED_CAP } from "#/constants"

type AcreTVLProgressProps = StackProps

const STEP_COUNT = 5

const getSteps = () =>
  Array(STEP_COUNT)
    .fill(0)
    .map(
      (_, index) =>
        (index + 1) * Math.floor(TOTAL_VALUE_LOCKED_CAP / STEP_COUNT),
    )

export function AcreTVLProgress(props: AcreTVLProgressProps) {
  const styles = useMultiStyleConfig("AcreTVLProgress")
  const totalValueLocked = useTVL()

  return (
    <Box sx={styles.container} {...props}>
      <HStack sx={styles.wrapper}>
        <Grid sx={styles.contentWrapper}>
          <BitcoinIcon sx={styles.valueIcon} />

          <CurrencyBalance
            size="3xl"
            amount={totalValueLocked.value}
            shouldBeFormatted={false}
            currency="bitcoin"
            desiredDecimals={2}
          />

          <TextMd>Total value locked</TextMd>
        </Grid>

        <VStack sx={styles.progressWrapper}>
          <HStack sx={styles.progressLabelsWrapper}>
            {getSteps().map((value) => (
              <TextXs key={value} sx={styles.progressLabel}>
                {value}
              </TextXs>
            ))}
          </HStack>

          <ProgressBar value={totalValueLocked.progress} />
        </VStack>
      </HStack>
    </Box>
  )
}

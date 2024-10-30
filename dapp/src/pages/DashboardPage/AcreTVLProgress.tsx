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
import { TextMd } from "#/components/shared/Typography"

type AcreTVLProgressProps = StackProps

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
            sx={styles.valueAmount}
            amount={totalValueLocked.value}
            currency="bitcoin"
          />

          <TextMd sx={styles.valueLabel}>Total value locked</TextMd>
        </Grid>

        <VStack sx={styles.progressWrapper}>
          <HStack sx={styles.progressLabelsWrapper}>
            {[50, 100, 150, 200, 250].map((value) => (
              <TextMd key={value} sx={styles.progressLabel}>
                {value}
              </TextMd>
            ))}
          </HStack>

          <ProgressBar />
        </VStack>
      </HStack>
    </Box>
  )
}

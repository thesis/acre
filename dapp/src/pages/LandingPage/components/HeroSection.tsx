import React from "react"
import { Button, VStack } from "@chakra-ui/react"
import { useMobileMode, useTransactionModal } from "#/hooks"
import { ACTION_FLOW_TYPES } from "#/types"
import { H2, TextLg } from "#/components/shared/Typography"

export default function HeroSection() {
  const openTransactionModal = useTransactionModal(ACTION_FLOW_TYPES.STAKE)

  const isMobileMode = useMobileMode()

  return (
    <VStack
      spacing={0}
      mt={{ md: 13 }}
      mb={{ base: 16, md: 20 }}
      align="center"
      textAlign="center"
    >
      <H2
        letterSpacing="-0.72px" // -2% of font size
        sx={{ textWrap: "balance" }}
        mb={2}
        fontWeight="semibold"
      >
        Bitcoin staking done right.
      </H2>
      <TextLg lineHeight={7} mb={10} fontWeight="medium">
        The open-source, decentralized way to grow your Bitcoin
      </TextLg>
      {!isMobileMode && (
        <Button
          size="lg"
          px={7}
          fontWeight="bold"
          lineHeight={6}
          h="auto"
          onClick={openTransactionModal}
        >
          Deposit BTC
        </Button>
      )}
    </VStack>
  )
}

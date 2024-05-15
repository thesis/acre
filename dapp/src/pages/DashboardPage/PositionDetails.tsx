import React from "react"
import {
  Button,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
} from "@chakra-ui/react"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { TextMd } from "#/components/shared/Typography"
import { MODAL_TYPES } from "#/types"
import { useEstimatedBTCBalance } from "#/hooks/store"
import { LiquidStakingTokenPopover } from "#/components/LiquidStakingTokenPopover"
import { useModal, useSize } from "#/hooks"

export default function PositionDetails(props: CardProps) {
  const estimatedBtcBalance = useEstimatedBTCBalance()
  const { ref, size } = useSize()
  const { openModal } = useModal()

  return (
    <Card ref={ref} {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          <LiquidStakingTokenPopover popoverSize={size} />
        </HStack>
        <CurrencyBalanceWithConversion
          from={{
            currency: "bitcoin",
            amount: estimatedBtcBalance.toString(),
            variant: "greater-balance-xl",
            symbolFontWeight: "semibold",
          }}
          to={{
            currency: "usd",
            size: "lg",
          }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        <Button
          size="lg"
          onClick={() => openModal(MODAL_TYPES.STAKE, { type: "stake" })}
        >
          Stake
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => openModal(MODAL_TYPES.UNSTAKE, { type: "unstake" })}
        >
          Unstake
        </Button>
      </CardFooter>
    </Card>
  )
}

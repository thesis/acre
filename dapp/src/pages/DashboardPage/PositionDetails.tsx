import React, { useCallback, useState } from "react"
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
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import TransactionModal from "#/components/TransactionModal"
import { useEstimatedBTCBalance } from "#/hooks/store"
import { LiquidStakingTokenPopover } from "#/components/LiquidStakingTokenPopover"
import { useSize } from "#/hooks"

export default function PositionDetails(props: CardProps) {
  const estimatedBtcBalance = useEstimatedBTCBalance()
  const { ref, size } = useSize()

  const [actionFlowType, setActionFlowType] = useState<
    ActionFlowType | undefined
  >(undefined)

  const handleCloseTransactionModal = useCallback(() => {
    setActionFlowType(undefined)
  }, [])

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
          onClick={() => setActionFlowType(ACTION_FLOW_TYPES.STAKE)}
        >
          Stake
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setActionFlowType(ACTION_FLOW_TYPES.UNSTAKE)}
        >
          Unstake
        </Button>
      </CardFooter>
      <TransactionModal
        isOpen={!!actionFlowType}
        defaultType={actionFlowType}
        onClose={handleCloseTransactionModal}
      />
    </Card>
  )
}

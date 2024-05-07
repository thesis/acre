import React from "react"
import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { useModalFlowContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { ACTION_FLOW_TYPES, ActionFlowType, TokenAmount } from "#/types"

const HEADER = {
  [ACTION_FLOW_TYPES.STAKE]: "Staking successful!",
  [ACTION_FLOW_TYPES.UNSTAKE]: "Unstaking successful!",
}

type SuccessModalProps = {
  type: ActionFlowType
  tokenAmount: TokenAmount
}

export default function SuccessModal({ type, tokenAmount }: SuccessModalProps) {
  const { onClose } = useModalFlowContext()

  return (
    <>
      <ModalHeader>{HEADER[type]}</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={20} />
          <Box>
            <CurrencyBalanceWithConversion
              from={{
                currency: tokenAmount.currency,
                amount: tokenAmount.amount.toString(),
                size: "4xl",
              }}
              to={{
                currency: "usd",
                size: "lg",
              }}
            />
          </Box>
        </VStack>
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Go to dashboard
        </Button>
      </ModalFooter>
    </>
  )
}

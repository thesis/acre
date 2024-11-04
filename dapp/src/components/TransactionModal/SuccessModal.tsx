import React from "react"
import {
  HStack,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { useActionFlowTokenAmount, useActionFlowTxHash } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import { IconArrowUpRight } from "@tabler/icons-react"
import { getEstimatedDuration } from "#/utils"
import { Alert, AlertIcon, AlertDescription } from "#/components/shared/Alert"
import { TextMd, TextSm } from "../shared/Typography"
import BlockExplorerLink from "../shared/BlockExplorerLink"

type SuccessModalProps = {
  type: ActionFlowType
}

export default function SuccessModal({ type }: SuccessModalProps) {
  const tokenAmount = useActionFlowTokenAmount()
  const txHash = useActionFlowTxHash()

  // TODO: We should use one type for flow and activity
  const activityType = type === ACTION_FLOW_TYPES.STAKE ? "deposit" : "withdraw"

  return (
    <>
      <ModalCloseButton />
      <ModalHeader textAlign="center" pt={16}>
        {ACTION_FLOW_TYPES.UNSTAKE === type
          ? "Withdrawal initiated!"
          : "Deposit received!"}
      </ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={14} />

          {tokenAmount && (
            <VStack spacing={0} mb={9}>
              <CurrencyBalanceWithConversion
                from={{
                  currency: tokenAmount.currency,
                  amount: tokenAmount.amount.toString(),
                  size: "4xl",
                  fontWeight: "semibold",
                }}
                to={{
                  currency: "usd",
                  size: "md",
                  fontWeight: "medium",
                }}
              />
            </VStack>
          )}
          {ACTION_FLOW_TYPES.UNSTAKE === type && (
            <TextMd>
              Funds will arrive in your wallet once the withdrawal is complete.
              Track progress in your dashboard.
            </TextMd>
          )}
          {ACTION_FLOW_TYPES.STAKE === type && txHash && (
            /* TODO: Update styles */
            <BlockExplorerLink id={txHash} type="transaction" chain="bitcoin">
              <HStack gap={1}>
                <TextSm color="grey.600" fontWeight="semibold">
                  View on Mempool
                </TextSm>
                <Icon as={IconArrowUpRight} color="brand.400" boxSize={4} />
              </HStack>
            </BlockExplorerLink>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter pt={2}>
        <Alert variant="elevated">
          <AlertIcon status="loading" />
          <AlertDescription>
            <TextSm>You can close this window.</TextSm>
            <TextSm>The process will continue in the background.</TextSm>
            <TextSm color="#7D6A4B">
              Estimated duration&nbsp; ~{" "}
              {getEstimatedDuration(tokenAmount?.amount ?? 0n, activityType)}
            </TextSm>
          </AlertDescription>
        </Alert>
      </ModalFooter>
    </>
  )
}

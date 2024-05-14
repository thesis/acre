import React from "react"
import {
  Button,
  HStack,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import { useModalFlowContext } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { ACTION_FLOW_TYPES, ActionFlowType, TokenAmount } from "#/types"
import { TextMd } from "../shared/Typography"
import Spinner from "../shared/Spinner"
import BlockExplorerLink from "../shared/BlockExplorerLink"

const CONTENT: Record<
  ActionFlowType,
  {
    header: string
    renderBody: (tokenAmount: TokenAmount) => React.ReactNode
    footer: string
  }
> = {
  [ACTION_FLOW_TYPES.STAKE]: {
    header: "Deposit received",
    renderBody: (tokenAmount) => (
      <>
        <VStack spacing={0}>
          <CurrencyBalanceWithConversion
            from={{
              currency: tokenAmount.currency,
              amount: tokenAmount.amount.toString(),
              size: "4xl",
            }}
            to={{
              currency: "usd",
              size: "lg",
              color: "grey.500",
              fontWeight: "semibold",
            }}
          />
        </VStack>
        {/* TODO: Use correct tx hash and update styles */}
        <BlockExplorerLink id="" type="transaction" chain="bitcoin" mt={2} />
      </>
    ),
    footer: "The staking will continue in the background",
  },
  [ACTION_FLOW_TYPES.UNSTAKE]: {
    header: "Withdrawal initiated",
    renderBody: () => (
      <TextMd>
        You’ll receive your funds once the unstaking process is completed.
        Follow the progress in your dashboard.
      </TextMd>
    ),
    footer: "The unstaking will continue in the background",
  },
}

type SuccessModalProps = {
  type: ActionFlowType
  tokenAmount: TokenAmount
}

export default function SuccessModal({ type, tokenAmount }: SuccessModalProps) {
  const { onClose } = useModalFlowContext()

  const { header, footer, renderBody } = CONTENT[type]

  return (
    <>
      <ModalHeader>{header}</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={20} />
          {renderBody(tokenAmount)}
        </VStack>
      </ModalBody>
      <ModalFooter pt={0}>
        <Button size="lg" width="100%" variant="outline" onClick={onClose}>
          Go to dashboard
        </Button>
        <HStack spacing={2}>
          <Spinner borderWidth={2} />
          <TextMd>{footer}</TextMd>
        </HStack>
      </ModalFooter>
    </>
  )
}

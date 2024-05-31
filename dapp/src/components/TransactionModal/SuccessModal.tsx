import React, { ReactNode } from "react"
import {
  Button,
  HStack,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import {
  useActionFlowTokenAmount,
  useActionFlowTxHash,
  useModal,
} from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import { useNavigate } from "react-router-dom"
import { routerPath } from "#/router/path"
import { IconArrowUpRight } from "@tabler/icons-react"
import { TextMd } from "../shared/Typography"
import Spinner from "../shared/Spinner"
import BlockExplorerLink from "../shared/BlockExplorerLink"

function StakeContent() {
  const tokenAmount = useActionFlowTokenAmount()
  const txHash = useActionFlowTxHash()

  return (
    <>
      {tokenAmount && (
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
      )}
      {/* TODO: Update styles */}
      {txHash && (
        <BlockExplorerLink
          id={txHash}
          type="transaction"
          chain="bitcoin"
          mt={2}
        >
          <HStack gap={1}>
            <TextMd fontWeight="semibold">View on Mempool</TextMd>
            <Icon as={IconArrowUpRight} color="brand.400" boxSize={5} />
          </HStack>
        </BlockExplorerLink>
      )}
    </>
  )
}

function UnstakeContent() {
  return (
    <TextMd>
      You’ll receive your funds once the unstaking process is completed. Follow
      the progress in your dashboard.
    </TextMd>
  )
}

const CONTENT: Record<
  ActionFlowType,
  {
    heading: string
    footer: string
    renderComponent: () => ReactNode
  }
> = {
  [ACTION_FLOW_TYPES.STAKE]: {
    heading: "Deposit received",
    renderComponent: StakeContent,
    footer: "The staking will continue in the background",
  },
  [ACTION_FLOW_TYPES.UNSTAKE]: {
    heading: "Withdrawal initiated",
    renderComponent: UnstakeContent,
    footer: "The unstaking will continue in the background",
  },
}

export default function SuccessModal({ type }: { type: ActionFlowType }) {
  const { closeModal } = useModal()
  const navigate = useNavigate()

  const { heading, footer, renderComponent } = CONTENT[type]

  return (
    <>
      <ModalHeader>{heading}</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={20} />
          {renderComponent()}
        </VStack>
      </ModalBody>
      <ModalFooter pt={0}>
        <Button
          size="lg"
          width="100%"
          variant="outline"
          onClick={() => {
            closeModal()
            navigate(routerPath.dashboard)
          }}
        >
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

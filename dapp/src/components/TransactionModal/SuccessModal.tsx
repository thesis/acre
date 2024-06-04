import React from "react"
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
import { useAllActivitiesCount, useFetchDeposits, useModal } from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import {
  ACTION_FLOW_TYPES,
  ActionFlowType,
  MODAL_TYPES,
  TokenAmount,
} from "#/types"
import { useNavigate } from "react-router-dom"
import { routerPath } from "#/router/path"
import { IconArrowUpRight } from "@tabler/icons-react"
import { logPromiseFailure } from "#/utils"
import { featureFlags } from "#/constants"
import { TextMd } from "../shared/Typography"
import Spinner from "../shared/Spinner"
import BlockExplorerLink from "../shared/BlockExplorerLink"

const CONTENT: Record<
  ActionFlowType,
  {
    header: string
    renderBody: (tokenAmount: TokenAmount, txHash: string) => React.ReactNode
    footer: string
  }
> = {
  [ACTION_FLOW_TYPES.STAKE]: {
    header: "Deposit received",
    renderBody: (tokenAmount, txHash) => (
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
        {/* TODO: Update styles */}
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
  txHash: string
}

export default function SuccessModal({
  type,
  tokenAmount,
  txHash,
}: SuccessModalProps) {
  const { closeModal, openModal } = useModal()
  const fetchDeposits = useFetchDeposits()
  const navigate = useNavigate()
  const allActivitiesCount = useAllActivitiesCount()

  const { header, footer, renderBody } = CONTENT[type]

  const handleCloseModal = () => {
    closeModal()
    navigate(routerPath.dashboard)

    if (featureFlags.GAMIFICATION_ENABLED) {
      // TODO: Temporary solution - Showing the welcome window should be done
      // only once a season for new users. "New" can also refer to users who,
      // in the past, may have deposited but withdrew their funds, losing their rewards.
      // By making a new deposit, they will get their rewards back.
      if (allActivitiesCount === 0) {
        openModal(MODAL_TYPES.WELCOME)
      }
    }

    logPromiseFailure(fetchDeposits())
  }

  return (
    <>
      <ModalHeader>{header}</ModalHeader>
      <ModalBody gap={10}>
        <VStack gap={4}>
          <LoadingSpinnerSuccessIcon boxSize={20} />
          {renderBody(tokenAmount, txHash)}
        </VStack>
      </ModalBody>
      <ModalFooter pt={0}>
        <Button
          size="lg"
          width="100%"
          variant="outline"
          onClick={handleCloseModal}
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

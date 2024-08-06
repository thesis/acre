import React, { ReactNode } from "react"
import {
  Button,
  HStack,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { LoadingSpinnerSuccessIcon } from "#/assets/icons"
import {
  useActionFlowTokenAmount,
  useActionFlowTxHash,
  useModal,
  useAllActivitiesCount,
  useFetchActivities,
  useAppNavigate,
} from "#/hooks"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { ACTION_FLOW_TYPES, ActionFlowType, MODAL_TYPES } from "#/types"
import { routerPath } from "#/router/path"
import { IconArrowUpRight } from "@tabler/icons-react"
import { logPromiseFailure } from "#/utils"
import { featureFlags } from "#/constants"
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

type SuccessModalProps = {
  type: ActionFlowType
}

export default function SuccessModal({ type }: SuccessModalProps) {
  const { closeModal, openModal } = useModal()
  const fetchActivities = useFetchActivities()
  const navigate = useAppNavigate()
  const allActivitiesCount = useAllActivitiesCount()

  const { heading, footer, renderComponent } = CONTENT[type]

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

    logPromiseFailure(fetchActivities())
  }

  return (
    <>
      {type === ACTION_FLOW_TYPES.UNSTAKE && <ModalCloseButton />}
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
          onClick={handleCloseModal}
        >
          Go to dashboard
        </Button>
        <HStack spacing={2}>
          <Spinner borderWidth={2} variant="filled" />
          <TextMd>{footer}</TextMd>
        </HStack>
      </ModalFooter>
    </>
  )
}

import React, { ReactNode, useCallback, useState } from "react"
import { Box, ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import {
  useStakeFlowContext,
  useTransactionContext,
  useWalletContext,
} from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType, BaseFormProps } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { logPromiseFailure } from "#/utils"
import StakeFormModal from "./ActiveStakingStep/StakeFormModal"
import UnstakeFormModal from "./ActiveUnstakingStep/UnstakeFormModal"

const FORM_DATA: Record<
  ActionFlowType,
  {
    heading: string
    renderComponent: (props: BaseFormProps<TokenAmountFormValues>) => ReactNode
  }
> = {
  stake: {
    heading: "Deposit",
    renderComponent: StakeFormModal,
  },
  unstake: {
    heading: "Withdraw",
    renderComponent: UnstakeFormModal,
  },
}

function ActionFormModal({ type }: { type: ActionFlowType }) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { setTokenAmount } = useTransactionContext()
  const { initStake } = useStakeFlowContext()

  const [isLoading, setIsLoading] = useState(false)

  const { heading, renderComponent } = FORM_DATA[type]

  const handleInitStake = useCallback(async () => {
    const btcAddress = btcAccount?.address
    const ethAddress = ethAccount?.address

    if (btcAddress && ethAddress) {
      await initStake(btcAddress, ethAddress)
    }
  }, [btcAccount?.address, ethAccount?.address, initStake])

  const handleSubmitForm = useCallback(
    async (values: TokenAmountFormValues) => {
      if (!values.amount) return

      try {
        setIsLoading(true)
        // TODO: Init unstake flow
        if (type === ACTION_FLOW_TYPES.STAKE) await handleInitStake()

        setTokenAmount({ amount: values.amount, currency: "bitcoin" })
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [handleInitStake, setTokenAmount, type],
  )

  const handleSubmitFormWrapper = useCallback(
    (values: TokenAmountFormValues) =>
      logPromiseFailure(handleSubmitForm(values)),
    [handleSubmitForm],
  )

  return (
    <>
      {!isLoading && <ModalCloseButton />}
      <ModalHeader>{heading}</ModalHeader>
      <ModalBody>
        <Box w="100%">
          {renderComponent({
            onSubmitForm: handleSubmitFormWrapper,
          })}
        </Box>
      </ModalBody>
    </>
  )
}

export default ActionFormModal

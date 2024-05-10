import React, { useCallback, useState } from "react"
import { Box, ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import { useAppDispatch, useStakeFlowContext, useWalletContext } from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { logPromiseFailure } from "#/utils"
import StakeFormModal from "./ActiveStakingStep/StakeFormModal"
import UnstakeFormModal from "./ActiveUnstakingStep/UnstakeFormModal"
import { setTokenAmount } from "#/store/action-flow"

const FORM_DATA: Record<
  ActionFlowType,
  {
    header: string
    FormComponent: (
      props: React.ComponentProps<
        typeof StakeFormModal | typeof UnstakeFormModal
      >,
    ) => React.ReactNode
  }
> = {
  stake: {
    header: "Deposit",
    FormComponent: StakeFormModal,
  },
  unstake: {
    header: "Withdraw",
    FormComponent: UnstakeFormModal,
  },
}

function ActionFormModal({ type }: { type: ActionFlowType }) {
  const { btcAccount, ethAccount } = useWalletContext()
  const { initStake } = useStakeFlowContext()
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const { header, FormComponent } = FORM_DATA[type]

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

        dispatch(setTokenAmount({ amount: values.amount, currency: "bitcoin" }))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, handleInitStake, type],
  )

  const handleSubmitFormWrapper = useCallback(
    (values: TokenAmountFormValues) =>
      logPromiseFailure(handleSubmitForm(values)),
    [handleSubmitForm],
  )

  return (
    <>
      {!isLoading && <ModalCloseButton />}
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        <Box w="100%">
          <FormComponent onSubmitForm={handleSubmitFormWrapper} />
        </Box>
      </ModalBody>
    </>
  )
}

export default ActionFormModal

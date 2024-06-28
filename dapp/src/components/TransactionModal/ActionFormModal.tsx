import React, { ReactNode, useCallback, useState } from "react"
import { Box, ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import { useAppDispatch, useStakeFlowContext } from "#/hooks"
import { ACTION_FLOW_TYPES, ActionFlowType, BaseFormProps } from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { logPromiseFailure } from "#/utils"
import { setTokenAmount } from "#/store/action-flow"
import StakeFormModal from "./ActiveStakingStep/StakeFormModal"
import UnstakeFormModal from "./ActiveUnstakingStep/UnstakeFormModal"

const FORM_DATA: Record<
  ActionFlowType,
  {
    heading: string
    FormComponent: (props: BaseFormProps<TokenAmountFormValues>) => ReactNode
  }
> = {
  [ACTION_FLOW_TYPES.STAKE]: {
    heading: "Deposit",
    FormComponent: StakeFormModal,
  },
  [ACTION_FLOW_TYPES.UNSTAKE]: {
    heading: "Withdraw",
    FormComponent: UnstakeFormModal,
  },
}

function ActionFormModal({ type }: { type: ActionFlowType }) {
  const { initStake } = useStakeFlowContext()
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const { heading, FormComponent } = FORM_DATA[type]

  const handleInitStake = useCallback(async () => {
    await initStake()
  }, [initStake])

  const handleSubmitForm = useCallback(
    async (values: TokenAmountFormValues) => {
      if (!values.amount) return

      try {
        setIsLoading(true)
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
      <ModalHeader>{heading}</ModalHeader>
      <ModalBody>
        <Box w="100%">
          <FormComponent onSubmitForm={handleSubmitFormWrapper} />
        </Box>
      </ModalBody>
    </>
  )
}

export default ActionFormModal

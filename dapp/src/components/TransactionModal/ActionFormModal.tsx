import React, { ReactNode, useCallback, useState } from "react"
import { Box, ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import {
  useAppDispatch,
  useMinWithdrawAmount,
  useStakeFlowContext,
  useWallet,
} from "#/hooks"
import {
  ACTION_FLOW_TYPES,
  ActionFlowType,
  BaseFormProps,
  PROCESS_STATUSES,
} from "#/types"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { logPromiseFailure } from "#/utils"
import { setStatus, setTokenAmount } from "#/store/action-flow"
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
  const minWithdrawAmount = useMinWithdrawAmount()
  const { balance } = useWallet()

  const [isLoading, setIsLoading] = useState(false)

  const { heading, FormComponent } = FORM_DATA[type]

  const handleInitStake = useCallback(async () => {
    await initStake()
  }, [initStake])

  const handleSubmitForm = useCallback(
    async (values: TokenAmountFormValues) => {
      if (!values.amount || !balance) return

      try {
        setIsLoading(true)
        if (type === ACTION_FLOW_TYPES.STAKE) await handleInitStake()

        dispatch(setTokenAmount({ amount: values.amount, currency: "bitcoin" }))

        const hasEnoughFundsForFutureWithdrawals =
          balance - values.amount >= minWithdrawAmount

        if (
          type === ACTION_FLOW_TYPES.UNSTAKE &&
          !hasEnoughFundsForFutureWithdrawals
        ) {
          dispatch(setStatus(PROCESS_STATUSES.NOT_ENOUGH_FUNDS))
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch, handleInitStake, type, balance, minWithdrawAmount],
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

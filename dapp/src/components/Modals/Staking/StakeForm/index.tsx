import React, { useCallback } from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN, BITCOIN_MIN_AMOUNT } from "../../../../constants"
import { ModalStep } from "../../../../contexts"
import { useWalletContext, useTransactionContext } from "../../../../hooks"
import TokenAmountForm from "../../../shared/TokenAmountForm"
import { TokenAmountFormValues } from "../../../shared/TokenAmountForm/TokenAmountFormBase"
import Details from "./Details"

const FORM_FIELD_NAME = "amount"
const FORM_ID = "staking-form"

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { seTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      seTokenAmount({ amount: values.amount, currency: BITCOIN })
      goNext()
    },
    [goNext, seTokenAmount],
  )

  return (
    <>
      <TokenAmountForm
        formId={FORM_ID}
        fieldName={FORM_FIELD_NAME}
        tokenBalanceInputPlaceholder="BTC"
        currency={BITCOIN}
        tokenBalance={btcAccount?.balance.toString() ?? "0"}
        minTokenAmount={BITCOIN_MIN_AMOUNT}
        onSubmitForm={handleSubmitForm}
      >
        <Details currency={BITCOIN} fieldName={FORM_FIELD_NAME} />
      </TokenAmountForm>
      <Button type="submit" form={FORM_ID} size="lg" width="100%" mt={4}>
        Stake
      </Button>
    </>
  )
}

export default StakeForm

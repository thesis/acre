import React, { useCallback } from "react"
import { Button } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "../../../../constants"
import { ModalStep } from "../../../../contexts"
import { useWalletContext, useTransactionContext } from "../../../../hooks"
import TokenAmountForm from "../../../shared/TokenAmountForm"
import { TokenAmountFormValues } from "../../../shared/TokenAmountForm/TokenAmountFormBase"
import { CurrencyType } from "../../../../types"
import Details from "./Details"

const CURRENCY_TYPE: CurrencyType = "bitcoin"
const FORM_FIELD_NAME = "amount"
const FORM_ID = "staking-form"

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { seTokenAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: TokenAmountFormValues) => {
      if (!values.amount) return

      seTokenAmount({ amount: values.amount, currencyType: CURRENCY_TYPE })
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
        currencyType={CURRENCY_TYPE}
        tokenBalance={btcAccount?.balance.toString() ?? "0"}
        minTokenAmount={BITCOIN_MIN_AMOUNT}
        onSubmitForm={handleSubmitForm}
      >
        <Details currencyType={CURRENCY_TYPE} fieldName={FORM_FIELD_NAME} />
      </TokenAmountForm>
      <Button type="submit" form={FORM_ID} size="lg" width="100%" mt={4}>
        Stake
      </Button>
    </>
  )
}

export default StakeForm

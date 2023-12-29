import React, { useCallback } from "react"
import { FormikErrors, withFormik } from "formik"
import { ModalStep } from "../../../contexts"
import FormBase, { FormBaseProps, FormValues } from "../../shared/FormBase"
import { useTransactionContext, useWalletContext } from "../../../hooks"
import { getErrorsObj, validateTokenAmount } from "../../../utils"

const StakeFormik = withFormik<
  { onSubmitForm: (values: FormValues) => void } & FormBaseProps,
  FormValues
>({
  mapPropsToValues: () => ({
    amount: "",
  }),
  validate: async ({ amount }, { tokenBalance }) => {
    const errors: FormikErrors<FormValues> = {}

    errors.amount = validateTokenAmount(amount, tokenBalance)

    return getErrorsObj(errors)
  },
  handleSubmit: (values, { props }) => {
    props.onSubmitForm(values)
  },
})(FormBase)

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()
  const { setAmount } = useTransactionContext()

  const handleSubmitForm = useCallback(
    (values: FormValues) => {
      setAmount(values.amount)
      goNext()
    },
    [goNext, setAmount],
  )

  return (
    <StakeFormik
      transactionType="stake"
      btnText="Stake"
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
      onSubmitForm={handleSubmitForm}
    />
  )
}

export default StakeForm

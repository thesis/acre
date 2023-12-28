import React from "react"
import { FormikErrors, withFormik } from "formik"
import { ModalStep } from "../../../contexts"
import FormBase, { FormBaseProps, FormValues } from "../../shared/FormBase"
import { useWalletContext } from "../../../hooks"
import { formatSatoshiAmount } from "../../../utils"
import { BITCOIN_MIN_AMOUNT, ERRORS } from "../../../constants"

const StakeFormik = withFormik<ModalStep & FormBaseProps, FormValues>({
  validate: ({ amount: value }, { tokenBalance }) => {
    const errors: FormikErrors<FormValues> = {}

    if (!value) errors.amount = ERRORS.REQUIRED
    else {
      const valueInBI = BigInt(value)
      const maxValueInBI = BigInt(tokenBalance)
      const minValueInBI = BigInt(BITCOIN_MIN_AMOUNT)

      const isMaximumValueExceeded = valueInBI > maxValueInBI
      const isMinimumValueFulfilled = valueInBI > minValueInBI

      if (isMaximumValueExceeded) errors.amount = ERRORS.EXCEEDED_VALUE
      else if (!isMinimumValueFulfilled)
        errors.amount = ERRORS.INSUFFICIENT_VALUE(
          formatSatoshiAmount(BITCOIN_MIN_AMOUNT),
        )
    }

    return errors
  },
  handleSubmit: (values, { props }) => {
    // TODO: Handle the correct form action
    props.goNext()
  },
})(FormBase)

function StakeForm({ goNext }: ModalStep) {
  const { btcAccount } = useWalletContext()

  return (
    <StakeFormik
      goNext={goNext}
      transactionType="stake"
      btnText="Stake"
      tokenBalance={btcAccount?.balance.toString() ?? "0"}
    />
  )
}

export default StakeForm

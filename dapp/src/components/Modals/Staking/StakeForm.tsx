import React from "react"
import { withFormik } from "formik"
import { ModalStep } from "../../../contexts"
import FormBase, { FormBaseProps, FormValues } from "../../shared/FormBase"
import { useWalletContext } from "../../../hooks"

// TODO: Add a validate function
const StakeFormik = withFormik<ModalStep & FormBaseProps, FormValues>({
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

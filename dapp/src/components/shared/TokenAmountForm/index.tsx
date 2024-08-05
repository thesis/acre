import { FormikErrors, withFormik } from "formik"
import { getErrorsObj, logPromiseFailure, validateTokenAmount } from "#/utils"
import { BaseFormProps } from "#/types"
import TokenAmountFormBase, {
  TokenAmountFormBaseProps,
  TokenAmountFormValues,
} from "./TokenAmountFormBase"

type TokenAmountFormProps = {
  minTokenAmount: bigint
} & TokenAmountFormBaseProps &
  BaseFormProps<TokenAmountFormValues>

const TokenAmountForm = withFormik<TokenAmountFormProps, TokenAmountFormValues>(
  {
    mapPropsToValues: () => ({
      amount: undefined,
    }),
    validate: ({ amount }, { tokenBalance, currency, minTokenAmount }) => {
      const errors: FormikErrors<TokenAmountFormValues> = {}

      errors.amount = validateTokenAmount(
        amount,
        tokenBalance,
        minTokenAmount,
        currency,
      )

      return getErrorsObj(errors)
    },
    handleSubmit: (values, { props, validateForm }) => {
      logPromiseFailure(validateForm(values))
      props.onSubmitForm(values)
    },
    validateOnBlur: false,
  },
)(TokenAmountFormBase)

export default TokenAmountForm

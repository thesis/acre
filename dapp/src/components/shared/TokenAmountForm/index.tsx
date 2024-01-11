import { FormikErrors, withFormik } from "formik"
import { getErrorsObj, validateTokenAmount } from "~/utils"
import TokenAmountFormBase, {
  TokenAmountFormBaseProps,
  TokenAmountFormValues,
} from "./TokenAmountFormBase"

type TokenAmountFormProps = {
  onSubmitForm: (values: TokenAmountFormValues) => void
  minTokenAmount: string
} & TokenAmountFormBaseProps

const TokenAmountForm = withFormik<TokenAmountFormProps, TokenAmountFormValues>(
  {
    mapPropsToValues: () => ({
      amount: undefined,
    }),
    validate: async (
      { amount },
      { tokenBalance, currency, minTokenAmount },
    ) => {
      const errors: FormikErrors<TokenAmountFormValues> = {}

      errors.amount = validateTokenAmount(
        amount,
        tokenBalance,
        minTokenAmount,
        currency,
      )

      return getErrorsObj(errors)
    },
    handleSubmit: (values, { props }) => {
      props.onSubmitForm(values)
    },
  },
)(TokenAmountFormBase)

export default TokenAmountForm

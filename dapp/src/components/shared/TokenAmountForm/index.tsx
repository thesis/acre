import { FormikErrors, withFormik } from "formik"
import { getErrorsObj, validateTokenAmount } from "#/utils"
import { ActionFlowType, BaseFormProps } from "#/types"
import TokenAmountFormBase, {
  TokenAmountFormBaseProps,
  TokenAmountFormValues,
} from "./TokenAmountFormBase"

type TokenAmountFormProps = {
  actionType: ActionFlowType
  minTokenAmount: bigint
} & TokenAmountFormBaseProps &
  BaseFormProps<TokenAmountFormValues>

const TokenAmountForm = withFormik<TokenAmountFormProps, TokenAmountFormValues>(
  {
    mapPropsToValues: () => ({
      amount: undefined,
    }),
    validate: (
      { amount },
      { tokenBalance, currency, minTokenAmount, actionType },
    ) => {
      const errors: FormikErrors<TokenAmountFormValues> = {}

      errors.amount = validateTokenAmount(
        actionType,
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
    validateOnBlur: true,
    validateOnChange: false,
  },
)(TokenAmountFormBase)

export default TokenAmountForm

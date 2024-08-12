import { FormikErrors, withFormik } from "formik"
import {
  getCurrencyByType,
  getErrorsObj,
  userAmountToBigInt,
  validateTokenAmount,
} from "#/utils"
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

      const { decimals } = getCurrencyByType(currency)
      const bigIntAmount =
        typeof amount === "string"
          ? userAmountToBigInt(amount, decimals)
          : amount

      errors.amount = validateTokenAmount(
        actionType,
        bigIntAmount,
        tokenBalance,
        minTokenAmount,
        currency,
      )

      return getErrorsObj(errors)
    },
    handleSubmit: (values, { props }) => {
      props.onSubmitForm(values)
    },
    validateOnBlur: false,
  },
)(TokenAmountFormBase)

export default TokenAmountForm

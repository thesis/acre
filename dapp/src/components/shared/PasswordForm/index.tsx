import { FormikErrors, withFormik } from "formik"
import { BaseFormProps } from "#/types"
import { getErrorsObj, validatePassword } from "#/utils"
import PasswordFormBase, {
  PasswordFormBaseProps,
  PasswordFormValues,
} from "./PasswordFormBase"

type PasswordFormProps = PasswordFormBaseProps &
  BaseFormProps<PasswordFormValues>

const PasswordForm = withFormik<PasswordFormProps, PasswordFormValues>({
  mapPropsToValues: () => ({
    password: "",
  }),
  validate: async ({ password }) => {
    const errors: FormikErrors<PasswordFormValues> = {}

    errors.password = await validatePassword(password)

    return getErrorsObj(errors)
  },
  handleSubmit: (values, { props }) => {
    props.onSubmitForm(values)
  },
  validateOnBlur: false,
  validateOnChange: false,
})(PasswordFormBase)

export default PasswordForm

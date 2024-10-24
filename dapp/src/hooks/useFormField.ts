import { logPromiseFailure } from "#/utils"
import { useField } from "formik"
import { useCallback } from "react"

export default function useFormField<T>(fieldName: string) {
  const [field, meta, helpers] = useField<T>(fieldName)

  const hasError = Boolean(meta.error)
  const errorMsgText = meta.error
  const isValid = !hasError && meta.touched && meta.value

  const onChange = useCallback(
    (value: T) => {
      if (!meta.touched) logPromiseFailure(helpers.setTouched(true))
      if (meta.error) helpers.setError(undefined)

      logPromiseFailure(helpers.setValue(value))
    },
    [helpers, meta.touched, meta.error],
  )

  return {
    field,
    value: meta.value,
    isValid,
    hasError,
    errorMsgText,
    onChange,
  }
}

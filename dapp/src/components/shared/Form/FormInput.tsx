import React, { ChangeEvent, useCallback } from "react"
import { FormControl, FormLabel, Input, InputProps } from "@chakra-ui/react"
import { useField } from "formik"
import { logPromiseFailure } from "#/utils"
import HelperErrorText from "./HelperErrorText"

export type FormInputProps = {
  name: string
  label?: string
  helperText?: string | JSX.Element
} & Omit<InputProps, "id" | "isInvalid" | "value" | "onChange">

export default function FormInput({
  name,
  label,
  helperText,
  ...inputProps
}: FormInputProps) {
  const [field, meta, helpers] = useField<string>(name)

  const hasError = Boolean(meta.error)
  const errorMsgText = meta.error

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!meta.touched) logPromiseFailure(helpers.setTouched(true))
      if (meta.error) helpers.setError(undefined)

      logPromiseFailure(helpers.setValue(event.target.value))
    },
    [helpers, meta.touched, meta.error],
  )

  return (
    <FormControl isInvalid={hasError} isDisabled={inputProps.isDisabled}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Input
        {...inputProps}
        {...field}
        id={name}
        isInvalid={hasError}
        value={meta.value}
        onChange={handleChange}
      />
      <HelperErrorText
        helperText={helperText}
        errorMsgText={errorMsgText}
        hasError={hasError}
      />
    </FormControl>
  )
}

import React from "react"
import { useFormikContext } from "formik"
import { ButtonProps } from "@chakra-ui/react"
import { LoadingButton } from "../LoadingButton"

export function FormSubmitButton({ children, ...props }: ButtonProps) {
  const { isSubmitting } = useFormikContext()

  return (
    <LoadingButton
      type="submit"
      size="lg"
      width="100%"
      isLoading={isSubmitting}
      {...props}
    >
      {children}
    </LoadingButton>
  )
}

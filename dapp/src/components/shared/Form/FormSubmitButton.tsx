import React from "react"
import { useFormikContext } from "formik"
import { Button, ButtonProps } from "@chakra-ui/react"
import Spinner from "../Spinner"

const LOADING_STYLE = {
  _disabled: { background: "gold.300", opacity: 1 },
  _hover: { opacity: 1 },
}

export function FormSubmitButton({ children, ...props }: ButtonProps) {
  const { isSubmitting } = useFormikContext()

  return (
    <Button
      type="submit"
      size="lg"
      width="100%"
      isLoading={isSubmitting}
      spinner={<Spinner />}
      {...(isSubmitting && LOADING_STYLE)}
      {...props}
    >
      {children}
    </Button>
  )
}

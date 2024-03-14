import React from "react"
import { Button, ButtonProps, Spinner } from "@chakra-ui/react"

const LOADING_STYLE = {
  _disabled: { background: "gold.300", opacity: 1 },
  _hover: { opacity: 1 },
}

export function LoadingButton({ isLoading, children, ...props }: ButtonProps) {
  return (
    <Button
      isLoading={isLoading}
      spinner={<Spinner />}
      {...(isLoading && LOADING_STYLE)}
      {...props}
    >
      {children}
    </Button>
  )
}

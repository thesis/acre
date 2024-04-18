import React from "react"
import { Button, ButtonProps, Spinner } from "@chakra-ui/react"

export function LoadingButton({ isLoading, children, ...props }: ButtonProps) {
  return (
    <Button isLoading={isLoading} spinner={<Spinner />} {...props}>
      {children}
    </Button>
  )
}

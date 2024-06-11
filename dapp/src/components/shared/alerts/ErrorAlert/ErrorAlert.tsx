import React from "react"
import { Alert, AlertProps } from "@chakra-ui/react"

export function ErrorAlert(props: AlertProps) {
  return (
    <Alert
      bg="red.100"
      borderWidth="1px"
      borderColor="red.200"
      w="full"
      boxShadow="none"
      rounded="lg"
      p={4}
      {...props}
    />
  )
}

import React from "react"
import {
  Spinner as ChakraSpinner,
  SpinnerProps as ChakraSpinnerProps,
} from "@chakra-ui/react"

export default function Spinner({ ...spinnerProps }: ChakraSpinnerProps) {
  return (
    <ChakraSpinner
      thickness="3px"
      speed="1s"
      emptyColor="gold.400"
      color="brand.400"
      {...spinnerProps}
    />
  )
}

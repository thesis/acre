import { UseToastOptions as ChakraToastProps } from "@chakra-ui/react"

export type ToastProps = ChakraToastProps & { delayMs?: number }

export type ToastCustomEvent = Omit<CustomEvent, "detail"> & {
  detail: ToastProps
}

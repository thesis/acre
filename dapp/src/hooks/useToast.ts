import { UseToastOptions, useToast as useChakraToast } from "@chakra-ui/react"

export function useToast(props: UseToastOptions) {
  return useChakraToast({
    position: "top",
    duration: null,
    isClosable: true,
    ...props,
  })
}

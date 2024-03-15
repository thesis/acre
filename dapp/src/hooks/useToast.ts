import { UseToastOptions, useToast as useChakraToast } from "@chakra-ui/react"
import { useCallback, useMemo } from "react"

export function useToast() {
  const toast = useChakraToast()

  const returnFunction = useCallback(
    (options: UseToastOptions) =>
      toast({
        position: "top",
        duration: null,
        isClosable: true,
        containerStyle: { my: 1 },
        ...options,
      }),
    [toast],
  )

  const open = useCallback(
    ({ id, ...options }: UseToastOptions) => {
      if (!id) {
        returnFunction(options)
      } else if (!toast.isActive(id)) {
        returnFunction({
          id,
          ...options,
        })
      }
    },
    [returnFunction, toast],
  )

  return useMemo(
    () => ({
      ...Object.assign(returnFunction, toast),
      open,
    }),
    [returnFunction, toast, open],
  )
}

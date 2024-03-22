import { UseToastOptions, useToast as useChakraToast } from "@chakra-ui/react"
import { useCallback, useMemo } from "react"

export function useToast() {
  const toast = useChakraToast()

  const overriddenToastFunction = useCallback(
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
        overriddenToastFunction(options)
      } else if (!toast.isActive(id)) {
        overriddenToastFunction({
          id,
          ...options,
        })
      }
    },
    [overriddenToastFunction, toast],
  )

  return useMemo(
    () => ({
      ...Object.assign(overriddenToastFunction, toast),
      open,
    }),
    [overriddenToastFunction, toast, open],
  )
}

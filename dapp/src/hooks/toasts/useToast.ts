import { UseToastOptions, useToast as useChakraToast } from "@chakra-ui/react"
import { useCallback, useMemo } from "react"

export function useToast() {
  const toast = useChakraToast()

  const overriddenToast = useCallback(
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
        overriddenToast(options)
      } else if (!toast.isActive(id)) {
        overriddenToast({
          id,
          ...options,
        })
      }
    },
    [overriddenToast, toast],
  )

  return useMemo(
    () => ({
      ...Object.assign(overriddenToast, toast),
      open,
    }),
    [overriddenToast, toast, open],
  )
}

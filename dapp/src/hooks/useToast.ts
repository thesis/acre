import {
  ToastId,
  UseToastOptions,
  useToast as useChakraToast,
} from "@chakra-ui/react"
import { useCallback } from "react"

export function useToast({
  id,
  ...props
}: Omit<UseToastOptions, "id"> & { id: ToastId }) {
  const toast = useChakraToast({
    position: "top",
    duration: null,
    isClosable: true,
    containerStyle: { my: 1 },
    ...props,
  })

  const showToast = useCallback(() => {
    if (!toast.isActive(id)) {
      toast({
        id,
      })
    }
  }, [id, toast])

  const closeToast = useCallback(() => toast.close(id), [id, toast])

  return { toast, showToast, closeToast }
}

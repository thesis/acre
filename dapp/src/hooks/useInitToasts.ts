import { useCallback, useEffect, useState } from "react"
import { useToast, ToastId } from "@chakra-ui/react"
import { ToastCustomEvent } from "#/types"

export function useInitToasts() {
  const toast = useToast()
  const [toastIdRefs, setToastIdRefs] = useState<ToastId[]>([])

  const openToast = useCallback(
    (event: ToastCustomEvent) => {
      const toastDetails = event.detail
      const { id, delayMs } = toastDetails
      if (id && !toastIdRefs?.includes(id)) {
        setTimeout(() => {
          toast(toastDetails)
          setToastIdRefs([...toastIdRefs, id])
        }, delayMs || 0)
      }
    },
    [toastIdRefs, toast],
  )

  const closeToast = useCallback(
    (event: ToastCustomEvent) => {
      const { id } = event.detail
      if (id && toastIdRefs?.includes(id)) {
        toast.close(id)
        const updatedToastsIds = toastIdRefs?.filter((el) => el !== id)
        setToastIdRefs(updatedToastsIds || [])
      }
    },
    [toastIdRefs, toast],
  )

  const closeAllToasts = useCallback(() => {
    toast.closeAll()
  }, [toast])

  useEffect(() => {
    document.addEventListener("openToast", openToast)
    document.addEventListener("closeToast", closeToast)
    document.addEventListener("closeAllToasts", closeAllToasts)

    return () => {
      document.removeEventListener("openToast", openToast)
      document.removeEventListener("closeToast", closeToast)
      document.removeEventListener("closeAllToasts", closeAllToasts)
    }
  }, [closeAllToasts, closeToast, openToast])
}

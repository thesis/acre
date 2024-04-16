import { ToastProps } from "#/types"
import { ToastId } from "@chakra-ui/react"

export class ToastService {
  static openToast(props: ToastProps) {
    return document.dispatchEvent(
      new CustomEvent("openToast", {
        detail: props,
      }),
    )
  }

  static closeToast(id: ToastId) {
    return document.dispatchEvent(
      new CustomEvent("closeToast", {
        detail: { id },
      }),
    )
  }

  static closeAllToasts() {
    return document.dispatchEvent(new CustomEvent("closeAllToasts"))
  }
}

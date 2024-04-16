import { ToastService } from "#/components/Toast/ToastService"
import { AlertStatus, ToastPosition } from "@chakra-ui/react"
import { useInitDataFromSdk, useInitializeAcreSdk } from "./sdk"
import { useSentry } from "./sentry"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useInitToasts } from "./useInitToasts"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useInitDataFromSdk()
  useFetchBTCPriceUSD()
  useInitToasts()

  setTimeout(() => {
    const toastProps = {
      id: "1",
      title: "Toast Service open.",
      description: "Unable to create user account.",
      duration: 9000,
      status: "error" as AlertStatus,
      position: "bottom" as ToastPosition,
    }
    ToastService.openToast(toastProps)
  }, 2000)
}

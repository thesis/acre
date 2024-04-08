import { useSentry } from "./sentry"
import { useInitializeAcreSdk } from "./useInitializeAcreSdk"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useInitGlobalToasts } from "./toasts/useInitGlobalToasts"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useFetchBTCPriceUSD()
  useInitGlobalToasts()
}

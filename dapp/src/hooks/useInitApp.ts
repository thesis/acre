import { useSentry } from "./sentry"
import { useInitializeAcreSdk } from "./useInitializeAcreSdk"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useShowWalletErrorToast } from "./useShowWalletErrorToast"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useFetchBTCPriceUSD()
  useShowWalletErrorToast("ethereum")
  useShowWalletErrorToast("bitcoin")
}

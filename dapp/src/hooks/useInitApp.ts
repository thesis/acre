import { useInitDataFromSdk, useInitializeAcreSdk } from "./sdk"
import { useSentry } from "./sentry"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useDetectPartner } from "./useDetectPartner"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useDetectPartner()
  useInitializeAcreSdk()
  useFetchBTCPriceUSD()
  // Let's hide this logic and remove it when we no longer need it.
  // useInitGlobalToasts()

  useInitDataFromSdk()
}

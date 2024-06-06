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
  useInitDataFromSdk()
  useFetchBTCPriceUSD()
}

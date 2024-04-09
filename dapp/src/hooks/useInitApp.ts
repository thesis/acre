import { useFetchSdkData, useInitializeAcreSdk } from "./sdk"
import { useSentry } from "./sentry"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useFetchBTCBalance } from "./useFetchBTCBalance"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useFetchSdkData()
  useFetchBTCPriceUSD()
  useFetchBTCBalance()
}

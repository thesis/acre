import { useSentry } from "./sentry"
import { useInitializeAcreSdk } from "./useInitializeAcreSdk"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useBtcBalance } from "./useBtcBalance"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useFetchBTCPriceUSD()
  useBtcBalance()
}

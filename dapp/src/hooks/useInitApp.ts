import { useInitDataFromSdk, useInitializeAcreSdk } from "./sdk"
import { useSentry } from "./sentry"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { useInitGlobalToasts } from "./toasts/useInitGlobalToasts"
import { useInitDataFromSubgraph } from "./subgraph"

export function useInitApp() {
  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()
  useFetchBTCPriceUSD()
  useInitGlobalToasts()

  useInitDataFromSdk()
  useInitDataFromSubgraph()
}

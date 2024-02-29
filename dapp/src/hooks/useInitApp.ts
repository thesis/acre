import { useEffect } from "react"
import { fetchBTCPriceUSD } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useAppDispatch } from "./store"
import { useInitializeAcreSdk } from "./useInitializeAcreSdk"
import { useSentry } from "./sentry"

export function useInitApp() {
  const dispatch = useAppDispatch()

  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useInitializeAcreSdk()

  useEffect(() => {
    logPromiseFailure(dispatch(fetchBTCPriceUSD()))
  }, [dispatch])
}

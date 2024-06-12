import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { BitcoinProvider } from "@acre-btc/sdk"
import { useOrangeKitProvider } from "../useOrangeKitProvider"

export function useInitializeAcreSdk() {
  const { init } = useAcreContext()
  const bitcoinProvider = useOrangeKitProvider()

  useEffect(() => {
    if (!bitcoinProvider) return

    const initSDK = async (provider: BitcoinProvider) => {
      await init(provider)
    }

    logPromiseFailure(initSDK(bitcoinProvider))
  }, [init, bitcoinProvider])
}

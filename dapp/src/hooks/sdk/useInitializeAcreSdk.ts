import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { BitcoinProvider } from "@acre-btc/sdk"
import { useBitcoinProvider } from "../orangeKit/useBitcoinProvider"

const { VITE_GELATO_RELAY_API_KEY } = import.meta.env

export function useInitializeAcreSdk() {
  const { init } = useAcreContext()
  const bitcoinProvider = useBitcoinProvider()

  useEffect(() => {
    if (!bitcoinProvider) return

    const initSDK = async (provider: BitcoinProvider) => {
      await init(provider, VITE_GELATO_RELAY_API_KEY)
    }

    logPromiseFailure(initSDK(bitcoinProvider))
  }, [init, bitcoinProvider])
}

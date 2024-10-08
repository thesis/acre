import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { BitcoinProvider } from "@acre-btc/sdk"
import { useBitcoinProvider } from "../orangeKit/useBitcoinProvider"

export function useInitializeAcreSdk() {
  const { init } = useAcreContext()
  const bitcoinProvider = useBitcoinProvider()

  useEffect(() => {
    const initSDK = async (provider?: BitcoinProvider) => {
      await init(provider)
    }

    logPromiseFailure(initSDK(bitcoinProvider))
  }, [init, bitcoinProvider])
}

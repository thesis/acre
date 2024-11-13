import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { AcreBitcoinProvider } from "@acre-btc/sdk"
import { useBitcoinProvider } from "../orangeKit/useBitcoinProvider"

export function useInitializeAcreSdk() {
  const { init } = useAcreContext()
  const bitcoinProvider = useBitcoinProvider()

  useEffect(() => {
    const initSDK = async (provider?: AcreBitcoinProvider) => {
      await init(provider)
    }

    logPromiseFailure(initSDK(bitcoinProvider))
  }, [init, bitcoinProvider])
}

import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { AcreBitcoinProvider } from "@acre-btc/sdk"
import useBitcoinProvider from "../orangeKit/useBitcoinProvider"
import useWallet from "../useWallet"

export default function useInitializeAcreSdk() {
  const { init } = useAcreContext()
  const bitcoinProvider = useBitcoinProvider()
  const { address } = useWallet()

  useEffect(() => {
    const initSDK = async (provider?: AcreBitcoinProvider) => {
      await init(provider)
    }

    logPromiseFailure(initSDK(bitcoinProvider))
  }, [init, bitcoinProvider, address])
}

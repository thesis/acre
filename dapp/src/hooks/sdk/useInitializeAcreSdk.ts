import { useEffect } from "react"
import { BITCOIN_NETWORK } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { LedgerLiveWalletApiBitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"
import { useWallet } from "../useWallet"

export function useInitializeAcreSdk() {
  const { address } = useWallet()
  const { init } = useAcreContext()

  useEffect(() => {
    if (!address) return

    const initSDK = async (bitcoinAccountId: string) => {
      const bitcoinProvider = await LedgerLiveWalletApiBitcoinProvider.init(
        bitcoinAccountId,
        BITCOIN_NETWORK,
      )
      await init(bitcoinProvider)
    }
    logPromiseFailure(initSDK(address))
  }, [address, init])
}

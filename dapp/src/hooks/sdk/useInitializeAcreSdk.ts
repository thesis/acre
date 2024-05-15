import { useEffect } from "react"
import { BITCOIN_NETWORK } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { LedgerLiveWalletApiBitcoinProvider } from "@acre-btc/sdk/dist/src/lib/bitcoin/providers"
import { useWalletContext } from "../useWalletContext"

export function useInitializeAcreSdk() {
  const { btcAccount } = useWalletContext()
  const { init } = useAcreContext()

  useEffect(() => {
    if (!btcAccount?.id) return

    const initSDK = async (bitcoinAccountId: string) => {
      const bitcoinProvider = await LedgerLiveWalletApiBitcoinProvider.init(
        bitcoinAccountId,
        BITCOIN_NETWORK,
      )
      await init(bitcoinProvider)
    }
    logPromiseFailure(initSDK(btcAccount.id))
  }, [btcAccount?.id, init])
}

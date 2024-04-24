import { useEffect } from "react"
import { ETHEREUM_NETWORK } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useWalletContext } from "../useWalletContext"

export function useInitializeAcreSdk() {
  const { btcAccount } = useWalletContext()
  const { init } = useAcreContext()
  const bitcoinAddress = btcAccount?.address

  useEffect(() => {
    if (!bitcoinAddress) return

    const initSDK = async (_bitcoinAddress: string) => {
      await init(_bitcoinAddress, ETHEREUM_NETWORK)
    }

    logPromiseFailure(initSDK(bitcoinAddress))
  }, [bitcoinAddress, init])
}

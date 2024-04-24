import { useEffect } from "react"
import { ETHEREUM_NETWORK } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useWalletContext } from "../useWalletContext"

export function useInitializeAcreSdk() {
  const { ethAccount } = useWalletContext()
  const { init } = useAcreContext()

  useEffect(() => {
    // TODO: Init Acre SDK w/o Ethereum account.
    if (!ethAccount) return

    const initSDK = async (ethAddress: string) => {
      await init(ethAddress, ETHEREUM_NETWORK)
    }
    logPromiseFailure(initSDK(ethAccount))
  }, [ethAccount, init])
}

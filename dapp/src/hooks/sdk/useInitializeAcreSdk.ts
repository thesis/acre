import { useEffect } from "react"
import { ETHEREUM_NETWORK } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useAcreContext } from "#/acre-react/hooks"
import { useWalletContext } from "../useWalletContext"

export function useInitializeAcreSdk() {
  const { ethAccount } = useWalletContext()
  const { init } = useAcreContext()

  useEffect(() => {
    if (!ethAccount?.address) return

    const initSDK = async (ethAddress: string) => {
      await init(ethAddress, ETHEREUM_NETWORK)
    }
    logPromiseFailure(initSDK(ethAccount.address))
  }, [ethAccount?.address, init])
}

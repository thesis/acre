import { useEffect } from "react"
import { EthereumAddress } from "@acre-btc/sdk"
import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { btcSlice } from "#/store/btc"
import { useWalletContext } from "./useWalletContext"
import { useAppDispatch } from "./store"

export function useFetchBtcBalance() {
  const { acre, isInitialized } = useAcreContext()
  const { ethAccount } = useWalletContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getBtcBalance = async () => {
      if (!isInitialized || !ethAccount || !acre) return

      const chainIdentifier = EthereumAddress.from(ethAccount.address)
      const sharesBalance = await acre.staking.sharesBalance(chainIdentifier)
      const estimatedBitcoinBalance =
        await acre.staking.estimatedBitcoinBalance(chainIdentifier)

      dispatch(btcSlice.actions.setSharesBalance(sharesBalance))
      dispatch(btcSlice.actions.setEstimatedBtcBalance(estimatedBitcoinBalance))
    }
    logPromiseFailure(getBtcBalance())
  }, [acre, isInitialized, ethAccount, dispatch])
}

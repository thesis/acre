import { useCallback, useEffect } from "react"
import { EthereumAddress } from "@acre-btc/sdk"
import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { btcSlice } from "#/store/btc"
import { useWalletContext } from "./useWalletContext"
import { useAppDispatch } from "./store"

export function useBtcBalance() {
  const { acre, isInitialized } = useAcreContext()
  const { ethAccount } = useWalletContext()
  const dispatch = useAppDispatch()

  const getBtcBalance = useCallback(async () => {
    if (isInitialized && ethAccount && acre) {
      const chainIdentifier = EthereumAddress.from(ethAccount.address)
      const sharesBalance = await acre.staking.sharesBalance(chainIdentifier)
      const estimatedBitcoinBalance =
        await acre.staking.estimatedBitcoinBalance(chainIdentifier)

      if (typeof sharesBalance === "bigint")
        dispatch(btcSlice.actions.setSharesBalance(sharesBalance))
      if (typeof estimatedBitcoinBalance === "bigint")
        dispatch(
          btcSlice.actions.setEstimatedBtcBalance(estimatedBitcoinBalance),
        )
    }
  }, [acre, isInitialized, ethAccount, dispatch])

  useEffect(() => {
    logPromiseFailure(getBtcBalance())
  }, [getBtcBalance])
}

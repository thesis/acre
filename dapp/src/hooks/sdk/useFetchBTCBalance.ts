import { useEffect } from "react"
import { EthereumAddress } from "@acre-btc/sdk"
import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { setEstimatedBtcBalance, setSharesBalance } from "#/store/btc"
import { ZeroAddress } from "ethers"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchBTCBalance() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getBtcBalance = async () => {
      if (!isInitialized || !acre) return

      // TODO: We should pass the Bitcoin address here once we update the SDK.
      const chainIdentifier = EthereumAddress.from(ZeroAddress)
      const sharesBalance = await acre.staking.sharesBalance(chainIdentifier)
      const estimatedBitcoinBalance =
        await acre.staking.estimatedBitcoinBalance(chainIdentifier)

      dispatch(setSharesBalance(sharesBalance))
      dispatch(setEstimatedBtcBalance(estimatedBitcoinBalance))
    }
    logPromiseFailure(getBtcBalance())
  }, [acre, isInitialized, dispatch])
}

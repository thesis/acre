import { useEffect } from "react"
import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { setEstimatedBtcBalance, setSharesBalance } from "#/store/wallet"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchBTCBalance() {
  const { acre, isConnected } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getBtcBalance = async () => {
      if (!isConnected || !acre) return

      const sharesBalance = await acre.account.sharesBalance()
      const estimatedBitcoinBalance =
        await acre.account.estimatedBitcoinBalance()

      dispatch(setSharesBalance(sharesBalance))
      dispatch(setEstimatedBtcBalance(estimatedBitcoinBalance))
    }
    logPromiseFailure(getBtcBalance())
  }, [acre, isConnected, dispatch])
}

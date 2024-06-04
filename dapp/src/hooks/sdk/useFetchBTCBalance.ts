import { useEffect } from "react"
import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { setEstimatedBtcBalance, setSharesBalance } from "#/store/btc"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchBTCBalance() {
  const { acre, isInitialized } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getBtcBalance = async () => {
      if (!isInitialized || !acre) return

      const sharesBalance = await acre.staking.sharesBalance()
      const estimatedBitcoinBalance =
        await acre.staking.estimatedBitcoinBalance()

      dispatch(setSharesBalance(sharesBalance))
      dispatch(setEstimatedBtcBalance(estimatedBitcoinBalance))
    }
    logPromiseFailure(getBtcBalance())
  }, [acre, isInitialized, dispatch])
}

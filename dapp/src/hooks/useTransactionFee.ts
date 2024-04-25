import { useAcreContext } from "#/acre-react/hooks"
import { setEstimatedDepositFee } from "#/store/btc"
import { logPromiseFailure } from "#/utils"
import { useEffect } from "react"
import { useAppDispatch, useEstimatedDepositFee } from "."

export function useTransactionFee(amount?: bigint) {
  const { acre, isInitialized } = useAcreContext()
  const estimatedDepositFee = useEstimatedDepositFee()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getEstimatedDepositFee = async () => {
      if (!acre) throw new Error("Acre SDK not defined")
      if (!amount) return
      const edf = await acre.staking.estimateDepositFee(amount)

      dispatch(setEstimatedDepositFee(edf))
    }
    logPromiseFailure(getEstimatedDepositFee())
  }, [acre, isInitialized, dispatch, amount])

  return estimatedDepositFee
}

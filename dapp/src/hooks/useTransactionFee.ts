import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { useEffect, useState } from "react"
import { DepositFee } from "#/types"
import { useAppDispatch } from "./store"

const initialDepositFee = {
  tbtc: 0n,
  acre: 0n,
  total: 0n,
}

export function useTransactionFee(amount?: bigint) {
  const [depositFee, setDepositFee] = useState<DepositFee>(initialDepositFee)
  const { acre } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!amount) {
      setDepositFee(initialDepositFee)
    } else {
      const getEstimatedDepositFee = async () => {
        if (!acre) return
        const fee = await acre.account.estimateDepositFee(amount)

        setDepositFee(fee)
      }
      logPromiseFailure(getEstimatedDepositFee())
    }
  }, [acre, dispatch, amount])

  return depositFee
}

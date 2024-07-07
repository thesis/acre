import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { useEffect, useState } from "react"
import { ACTION_FLOW_TYPES, ActionFlowType, Fee } from "#/types"
import { useAppDispatch } from "./store"

export const initialFee = {
  tbtc: 0n,
  acre: 0n,
  total: 0n,
}

export function useTransactionFee(
  amount: bigint | undefined,
  flow: ActionFlowType,
): Fee {
  const [depositFee, setDepositFee] = useState<Fee>(initialFee)
  const { acre } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!amount) {
      setDepositFee(initialFee)
    } else {
      const getEstimatedDepositFee = async () => {
        if (!acre) return

        let fee: Fee = initialFee

        if (flow === ACTION_FLOW_TYPES.STAKE) {
          fee = await acre.protocol.estimateDepositFee(amount)
        } else if (flow === ACTION_FLOW_TYPES.UNSTAKE) {
          // TODO: Fetch fees from SDK.
          fee = await acre.protocol.estimateWithdrawalFee(amount)
        }

        setDepositFee(fee)
      }
      logPromiseFailure(getEstimatedDepositFee())
    }
  }, [acre, dispatch, amount, flow])

  return depositFee
}

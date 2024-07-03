import { useAcreContext } from "#/acre-react/hooks"
import { logPromiseFailure } from "#/utils"
import { useEffect, useState } from "react"
import { ACTION_FLOW_TYPES, ActionFlowType, DepositFee } from "#/types"
import { useAppDispatch } from "./store"

export const initialDepositFee = {
  tbtc: 0n,
  acre: 0n,
  total: 0n,
}

// TODO: Not sure about the withdrawal fee type but I'm assuming we can split
// them in the same way as we did for deposit (in this case we should rename
// `DepositFee` type to something more generic).
type WithdrawalFee = DepositFee

export function useTransactionFee<F extends ActionFlowType>(
  amount: bigint | undefined,
  flow: F,
): F extends "STAKE" ? DepositFee : WithdrawalFee {
  const [depositFee, setDepositFee] = useState<DepositFee>(initialDepositFee)
  const { acre } = useAcreContext()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!amount) {
      setDepositFee(initialDepositFee)
    } else {
      const getEstimatedDepositFee = async () => {
        if (!acre) return

        let fee: DepositFee = initialDepositFee

        if (flow === ACTION_FLOW_TYPES.STAKE) {
          fee = await acre.protocol.estimateDepositFee(amount)
        } else if (flow === ACTION_FLOW_TYPES.UNSTAKE) {
          // TODO: Fetch fees from SDK.
          fee = { acre: 0n, tbtc: 0n, total: 0n }
        }

        setDepositFee(fee)
      }
      logPromiseFailure(getEstimatedDepositFee())
    }
  }, [acre, dispatch, amount, flow])

  return depositFee
}

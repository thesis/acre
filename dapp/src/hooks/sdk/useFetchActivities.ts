import { useCallback } from "react"
import { setActivities } from "#/store/wallet"
import { useAcreContext } from "#/acre-react/hooks"
import { Activity } from "#/types"
import { DepositStatus } from "@acre-btc/sdk"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchActivities() {
  const dispatch = useAppDispatch()
  const { acre, isConnected } = useAcreContext()

  return useCallback(async () => {
    if (!acre || !isConnected) return

    const deposits: Activity[] = (await acre.account.getDeposits()).map(
      (deposit) => ({
        ...deposit,
        status:
          deposit.status === DepositStatus.Finalized ? "completed" : "pending",
        type: "deposit",
      }),
    )

    const withdrawals: Activity[] = (await acre.account.getWithdrawals()).map(
      (withdraw) => {
        const { bitcoinTransactionId, status, ...rest } = withdraw

        return {
          ...rest,
          txHash: bitcoinTransactionId,
          status: status === "finalized" ? "completed" : "pending",
          type: "withdraw",
        }
      },
    )

    dispatch(setActivities([...deposits, ...withdrawals]))
  }, [acre, dispatch, isConnected])
}

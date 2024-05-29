import { useCallback } from "react"
import { setActivities } from "#/store/wallet"
import { useAcreContext } from "#/acre-react/hooks"
import { Activity } from "#/types"
import { DepositStatus } from "@acre-btc/sdk"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchDeposits() {
  const dispatch = useAppDispatch()
  const { acre } = useAcreContext()

  return useCallback(async () => {
    if (!acre) return

    const result: Activity[] = (await acre.staking.getDeposits()).map(
      (deposit) => ({
        ...deposit,
        status:
          deposit.status === DepositStatus.Finalized ? "completed" : "pending",
        type: "deposit",
      }),
    )

    dispatch(setActivities(result))
  }, [acre, dispatch])
}

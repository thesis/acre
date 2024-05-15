import { useCallback } from "react"
import { setActivities } from "#/store/wallet"
import { useAcreContext } from "#/acre-react/hooks"
import { useAppDispatch } from "../store/useAppDispatch"

export function useFetchDeposits() {
  const dispatch = useAppDispatch()
  const { acre } = useAcreContext()

  return useCallback(async () => {
    if (!acre) return

    const result = await acre.staking.getDeposits()

    dispatch(setActivities(result))
  }, [acre, dispatch])
}

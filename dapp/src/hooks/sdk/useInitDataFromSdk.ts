import { useEffect } from "react"
import { setActivities } from "#/store/wallet"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import useActivitiesQuery from "./useActivitiesQuery"
import { useAppDispatch } from "../store/useAppDispatch"

export function useInitDataFromSdk() {
  const { data } = useActivitiesQuery()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setActivities(data ?? []))
  }, [data, dispatch])

  useFetchMinDepositAmount()
}

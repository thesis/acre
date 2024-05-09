import { useEffect } from "react"
import { logPromiseFailure } from "#/utils"
import { useFetchActivities } from "./useFetchActivities"
import { useWalletContext } from "../useWalletContext"

export function useInitDataFromSubgraph() {
  const { btcAccount } = useWalletContext()
  const fetchActivities = useFetchActivities()

  useEffect(() => {
    if (btcAccount) {
      logPromiseFailure(fetchActivities())
    }
  }, [btcAccount, fetchActivities])
}

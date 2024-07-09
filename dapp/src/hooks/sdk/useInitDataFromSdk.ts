import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { logPromiseFailure } from "#/utils"
import { REFETCH_INTERVAL_IN_MILLISECONDS } from "#/constants"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchActivities } from "./useFetchActivities"
import { useWallet } from "../useWallet"

export function useInitDataFromSdk() {
  const { address } = useWallet()
  const fetchActivities = useFetchActivities()

  useEffect(() => {
    if (address) {
      logPromiseFailure(fetchActivities())
    }
  }, [address, fetchActivities])

  useFetchMinDepositAmount()
  useInterval(
    () => logPromiseFailure(fetchActivities()),
    REFETCH_INTERVAL_IN_MILLISECONDS,
  )
}

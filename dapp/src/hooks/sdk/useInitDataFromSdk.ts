import { useEffect } from "react"
import { useInterval } from "@chakra-ui/react"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { logPromiseFailure } from "#/utils"
import { useFetchBTCBalance } from "./useFetchBTCBalance"
import { useFetchMinDepositAmount } from "./useFetchMinDepositAmount"
import { useFetchTotalAssets } from "./useFetchTotalAssets"
import { useFetchActivities } from "./useFetchActivities"
import { useWallet } from "../useWallet"

const INTERVAL_TIME = ONE_SEC_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 30

export function useInitDataFromSdk() {
  const { address } = useWallet()
  const fetchActivities = useFetchActivities()

  useEffect(() => {
    if (address) {
      logPromiseFailure(fetchActivities())
    }
  }, [address, fetchActivities])

  useFetchBTCBalance()
  useFetchMinDepositAmount()
  useFetchTotalAssets()
  useInterval(() => logPromiseFailure(fetchActivities()), INTERVAL_TIME)
}

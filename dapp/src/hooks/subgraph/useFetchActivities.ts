import { useCallback, useEffect } from "react"
import { logPromiseFailure, subgraphAPI } from "#/utils"
import { setActivities, setTransactions } from "#/store/wallet"
import { useInterval } from "@chakra-ui/react"
import { ONE_MINUTE_IN_SECONDS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import { useAppDispatch } from "../store/useAppDispatch"
import { useWalletContext } from "../useWalletContext"

const INTERVAL_TIME = ONE_SEC_IN_MILLISECONDS * ONE_MINUTE_IN_SECONDS * 30
// TODO: Use the correct function from SDK
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateEthAddress = (btcAddress: string) =>
  "0x45e2e415989477ea5450e440405f6ac858019e6b"

export function useFetchActivities() {
  const dispatch = useAppDispatch()
  const { btcAccount } = useWalletContext()

  const fetchActivities = useCallback(async () => {
    if (!btcAccount) return

    const ethAddress = calculateEthAddress(btcAccount.address)
    const result = await subgraphAPI.fetchActivityData(ethAddress)
    const activities = result.filter(({ status }) => status !== "completed")

    dispatch(setTransactions(result))
    dispatch(setActivities(activities))
  }, [btcAccount, dispatch])

  const handleFetchActivities = useCallback(
    () => logPromiseFailure(fetchActivities()),
    [fetchActivities],
  )

  useEffect(() => {
    if (!btcAccount) return

    handleFetchActivities()
  }, [btcAccount, dispatch, handleFetchActivities])

  useInterval(handleFetchActivities, INTERVAL_TIME)
}

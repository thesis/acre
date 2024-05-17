import { useCallback } from "react"
import { setActivities, setTransactions } from "#/store/wallet"
import { logPromiseFailure, subgraphAPI } from "#/utils"
import { useAppDispatch } from "../store/useAppDispatch"
import { useWalletContext } from "../useWalletContext"

// TODO: Use the correct function from SDK
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateEthAddress = (btcAddress: string) =>
  "0x45e2e415989477ea5450e440405f6ac858019e6b"

export function useFetchDeposits() {
  const dispatch = useAppDispatch()
  const { btcAccount } = useWalletContext()

  const fetchDeposits = useCallback(async () => {
    if (!btcAccount) return

    // TODO: Use function from the SDK.
    const ethAddress = calculateEthAddress(btcAccount.address)
    const result = await subgraphAPI.fetchActivityData(ethAddress)
    const activities = result.filter(({ status }) => status !== "completed")

    dispatch(setTransactions(result))
    dispatch(setActivities(activities))
  }, [btcAccount, dispatch])

  return useCallback(() => logPromiseFailure(fetchDeposits()), [fetchDeposits])
}

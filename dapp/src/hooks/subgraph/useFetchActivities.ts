import { useCallback } from "react"
import { subgraphAPI } from "#/utils"
import { setActivities } from "#/store/wallet"
import { useAppDispatch } from "../store/useAppDispatch"
import { useWalletContext } from "../useWalletContext"

// TODO: Use the correct function from SDK
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateEthAddress = (btcAddress: string) =>
  "0x4c9e39e5ff458a811708c03aea21b8327118cf13"

export function useFetchActivities() {
  const dispatch = useAppDispatch()
  const { btcAccount } = useWalletContext()

  return useCallback(async () => {
    if (!btcAccount) return

    const ethAddress = calculateEthAddress(btcAccount.address)
    const result = await subgraphAPI.fetchActivityData(ethAddress)

    dispatch(setActivities(result))
  }, [btcAccount, dispatch])
}

import { queryKeysFactory, REFETCH_INTERVAL_IN_MILLISECONDS } from "#/constants"
import { useQuery } from "@tanstack/react-query"
import { Activity } from "#/types"
import { DepositStatus } from "@acre-btc/sdk"
import { useAcreContext } from "#/acre-react/hooks"
import { sortActivitiesByTimestamp } from "#/utils"
import { useWallet } from "./useWallet"

const { userKeys } = queryKeysFactory

export default function useActivities() {
  const { address } = useWallet()
  const { acre, isConnected } = useAcreContext()

  return useQuery({
    queryKey: [...userKeys.activities(), { acre, isConnected, address }],
    enabled: isConnected && !!acre && !!address,
    queryFn: async () => {
      if (!acre) return undefined

      const deposits: Activity[] = (await acre.account.getDeposits()).map(
        (deposit) => ({
          ...deposit,
          status:
            deposit.status === DepositStatus.Finalized
              ? "completed"
              : "pending",
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
      return sortActivitiesByTimestamp([...deposits, ...withdrawals])
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}

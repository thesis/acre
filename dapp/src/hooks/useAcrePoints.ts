import { useMutation, useQuery } from "@tanstack/react-query"
import {
  acrePoints as acrePointsUtils,
  bigIntToUserAmount,
  dateToUnixTimestamp,
} from "#/utils"
import { queryKeysFactory } from "#/constants"
import { useWallet } from "./useWallet"

const { acreKeys } = queryKeysFactory

type UseAcrePointsReturnType = {
  totalBalance: number
  claimableBalance: number
  nextDropTimestamp?: number
  handleClaim: () => void
  updateBalance: () => Promise<unknown>
}

export default function useAcrePoints(): UseAcrePointsReturnType {
  const { address = "" } = useWallet()

  const acrePointsQuery = useQuery({
    queryKey: [...acreKeys.claimedAcrePoints(), address],
    queryFn: async () => acrePointsUtils.getAcrePoints(address),
  })

  const { mutate: handleClaim } = useMutation({
    mutationFn: async () => acrePointsUtils.handleClaimAcrePoints(address),
    onSettled: async () => {
      await acrePointsQuery.refetch()
    },
  })

  const totalBalance = bigIntToUserAmount(
    BigInt(acrePointsQuery.data?.claimed ?? 0),
    0,
  )
  const claimableBalance = bigIntToUserAmount(
    BigInt(acrePointsQuery.data?.unclaimed ?? 0),
    0,
  )

  const nextDropTimestamp = dateToUnixTimestamp(
    new Date(acrePointsQuery.data?.dropAt ?? 0),
  )

  return {
    totalBalance,
    claimableBalance,
    nextDropTimestamp,
    handleClaim,
    updateBalance: acrePointsQuery.refetch,
  }
}

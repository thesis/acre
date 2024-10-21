import { useAcreContext } from "#/acre-react/hooks"
import { useQuery } from "@tanstack/react-query"
import { REFETCH_INTERVAL_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { useWallet } from "../useWallet"

const { userKeys } = queryKeysFactory

export default function useBitcoinPosition() {
  const { address } = useWallet()
  const { acre, isConnected } = useAcreContext()

  return useQuery({
    queryKey: [...userKeys.position(), { acre, isConnected, address }],
    enabled: isConnected && !!acre && !!address,
    queryFn: async () => {
      if (!isConnected || !acre || !address)
        return { sharesBalance: 0n, estimatedBitcoinBalance: 0n }

      const sharesBalance = await acre.account.sharesBalance()
      const estimatedBitcoinBalance =
        await acre.account.estimatedBitcoinBalance()

      return { sharesBalance, estimatedBitcoinBalance }
    },
    refetchInterval: REFETCH_INTERVAL_IN_MILLISECONDS,
  })
}

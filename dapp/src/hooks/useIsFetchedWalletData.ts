import { useIsSignedMessage } from "./store"
import {
  useActivitiesQuery,
  useBitcoinBalanceQuery,
  useBitcoinPositionQuery,
  useUserPointsDataQuery,
} from "./tanstack-query"

export default function useIsFetchedWalletData() {
  const isSignedMessage = useIsSignedMessage()
  const { isFetched: isBitcoinBalanceFetched } = useBitcoinBalanceQuery()
  const { isFetched: isBitcoinPositionFetched } = useBitcoinPositionQuery()
  const { isFetched: isActivitiesFetched } = useActivitiesQuery()
  const { isFetched: isPointsDataFetched } = useUserPointsDataQuery()

  const isFetchedData =
    isBitcoinBalanceFetched &&
    isActivitiesFetched &&
    isBitcoinPositionFetched &&
    isPointsDataFetched

  return (isSignedMessage && isFetchedData) || !isSignedMessage
}

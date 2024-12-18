import { useIsSignedMessage } from "./store"
import useActivities from "./useActivities"
import useBitcoinBalance from "./useBitcoinBalance"
import useBitcoinPosition from "./useBitcoinPosition"
import useUserPointsData from "./useUserPointsData"

export default function useIsFetchedWalletData() {
  const isSignedMessage = useIsSignedMessage()
  const { isFetched: isBitcoinBalanceFetched } = useBitcoinBalance()
  const { isFetched: isBitcoinPositionFetched } = useBitcoinPosition()
  const { isFetched: isActivitiesFetched } = useActivities()
  const { isFetched: isPointsDataFetched } = useUserPointsData()

  const isFetchedData =
    isBitcoinBalanceFetched &&
    isActivitiesFetched &&
    isBitcoinPositionFetched &&
    isPointsDataFetched

  return (isSignedMessage && isFetchedData) || !isSignedMessage
}

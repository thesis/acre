import { queryKeysFactory } from "#/constants"
import { useIsFetching } from "@tanstack/react-query"
import { useHasFetchedActivities, useIsSignedMessage } from "./store"

const { userKeys } = queryKeysFactory

export default function useIsFetchedWalletData() {
  const isSignedMessage = useIsSignedMessage()
  const hasFetchedActivities = useHasFetchedActivities()
  const fetchingQueries = useIsFetching({
    queryKey: userKeys.all,
    predicate: (query) => query.state.data === undefined,
  })

  return isSignedMessage && fetchingQueries === 0 && hasFetchedActivities
}

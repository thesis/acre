import { selectHasFetchedActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

function useHasFetchedActivities() {
  return useAppSelector(selectHasFetchedActivities)
}

export default useHasFetchedActivities

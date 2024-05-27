import { selectLatestActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useLatestActivities() {
  return useAppSelector(selectLatestActivities)
}

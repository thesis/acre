import { selectAllActivitiesCount } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useAllActivitiesCount() {
  return useAppSelector(selectAllActivitiesCount)
}

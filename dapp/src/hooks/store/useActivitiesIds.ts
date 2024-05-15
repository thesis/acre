import { selectActivitiesIds } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useActivitiesIds() {
  return useAppSelector(selectActivitiesIds)
}

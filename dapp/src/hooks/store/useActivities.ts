import { selectActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useActivities() {
  return useAppSelector(selectActivities)
}

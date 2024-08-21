import { selectActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export default function useActivities() {
  return useAppSelector(selectActivities)
}

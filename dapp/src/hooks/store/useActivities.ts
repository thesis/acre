import { selectActivities } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export default function useActivities() {
  const data = useAppSelector(selectActivities)
  const status: "pending" | "idle" = data.some(
    (activity) => activity.status === "pending",
  )
    ? "pending"
    : "idle"

  return { data, status }
}

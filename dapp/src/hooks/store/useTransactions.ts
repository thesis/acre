import { selectTransactions } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useTransactions() {
  return useAppSelector(selectTransactions)
}

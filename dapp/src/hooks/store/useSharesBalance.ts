import { selectSharesBalance } from "#/store/btc"
import { useAppSelector } from "./useAppSelector"

export function useSharesBalance() {
  return useAppSelector(selectSharesBalance)
}

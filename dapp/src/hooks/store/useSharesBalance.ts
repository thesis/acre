import { selectSharesBalance } from "#/store/wallet"
import { useAppSelector } from "./useAppSelector"

export function useSharesBalance() {
  return useAppSelector(selectSharesBalance)
}

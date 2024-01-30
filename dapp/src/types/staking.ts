import { CurrencyType } from "./currency"

export type TokenAmount = {
  amount: bigint
  currency: CurrencyType
}

import { CurrencyType } from "./currency"

export type TokenAmount = {
  amount: bigint
  currencyType: CurrencyType
}

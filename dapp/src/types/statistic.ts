import { CurrencyType } from "./currency"

// TODO: Update type when subgraph's ready
export type StatisticType = {
  name: string
  currency: CurrencyType
  amount: number
  totalAmount?: number
}

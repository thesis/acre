import { CURRENCIES_BY_TYPE } from "../constants"
import { Currency, CurrencyType } from "../types"

export const getCurrencyByType = (type: CurrencyType): Currency =>
  CURRENCIES_BY_TYPE[type]

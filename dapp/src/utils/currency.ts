import { CURRENCIES_BY_TYPE } from "../constants"
import { Currency, CurrencyType } from "../types"

export const getCurrencyByType = (type: CurrencyType): Currency =>
  CURRENCIES_BY_TYPE[type]

export const isCurrencyType = (
  currency: Currency | CurrencyType,
): currency is CurrencyType => typeof currency === "string"

import { Currency, CurrencyType } from "#/types"
import { CURRENCIES_BY_TYPE } from "#/constants"

export const getCurrencyByType = (currency: CurrencyType): Currency =>
  CURRENCIES_BY_TYPE[currency]

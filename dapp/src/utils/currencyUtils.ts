import { Currency, CurrencyType } from "#/types"
import { currencies } from "#/constants"

const getCurrencyByType = (currency: CurrencyType): Currency =>
  currencies.CURRENCIES_BY_TYPE[currency]

export default {
  getCurrencyByType,
}

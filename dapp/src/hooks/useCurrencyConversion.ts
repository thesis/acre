import { CurrencyBalanceProps } from "#/components/shared/CurrencyBalance"
import { CURRENCIES_BY_TYPE } from "#/constants"
import { selectBtcUsdPrice } from "#/store/btc"
import { bigIntToUserAmount } from "#/utils"
import { useAppSelector } from "./store"

export function useCurrencyConversion(
  from: CurrencyBalanceProps,
  to: CurrencyBalanceProps,
) {
  const usdPrice = useAppSelector(selectBtcUsdPrice)

  if (!from.amount || BigInt(from.amount) < 0n) return undefined

  switch (from.currency) {
    case "bitcoin":
      if (to.currency === "usd") {
        const fromAmount = bigIntToUserAmount(
          BigInt(from.amount),
          CURRENCIES_BY_TYPE[from.currency].decimals,
          CURRENCIES_BY_TYPE[from.currency].desiredDecimals,
        )
        const conversionAmount = fromAmount * usdPrice
        return conversionAmount
      }
      return undefined
    default:
      return undefined
  }
}

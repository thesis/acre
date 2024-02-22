import { useSelector } from "react-redux"
import { CurrencyBalanceProps } from "#/components/shared/CurrencyBalance"
import { CURRENCIES_BY_TYPE } from "#/constants"
import { selectBtcUsdPrice } from "#/store/btc"
import { bigIntToUserAmount } from "#/utils"

export function useCurrencyConversion(
  from: CurrencyBalanceProps,
  to: CurrencyBalanceProps,
) {
  const usdPrice = useSelector(selectBtcUsdPrice)

  if (!from.amount || BigInt(from.amount) < 0n) return undefined

  switch (from.currency) {
    case "bitcoin":
      if (to.currency === "usd") {
        const fixedPointDecimals =
          CURRENCIES_BY_TYPE[to.currency].fixedPointDecimals ||
          CURRENCIES_BY_TYPE[to.currency].desiredDecimals
        const fromAmount = bigIntToUserAmount(
          BigInt(from.amount),
          CURRENCIES_BY_TYPE[from.currency].desiredDecimals,
        )
        const toAmount = bigIntToUserAmount(
          BigInt(usdPrice),
          fixedPointDecimals,
        )
        const conversionAmount = fromAmount * toAmount
        return conversionAmount
      }
      return undefined
    default:
      return undefined
  }
}

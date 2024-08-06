import { CURRENCIES_BY_TYPE } from "#/constants"
import { selectBtcUsdPrice } from "#/store/btc"
import { bigIntToUserAmount } from "#/utils"
import { CurrencyType } from "#/types"
import { useMemo } from "react"
import { useAppSelector } from "./store"

type CurrencyConversionType = {
  currency: CurrencyType
  amount?: number | string | bigint
}

// TODO: should be updated to handle another currencies
const isBtcUsdConversion = (
  from: CurrencyConversionType,
  to: CurrencyConversionType,
): boolean => from.currency === "bitcoin" && to.currency === "usd"

export function useCurrencyConversion({
  from,
  to,
}: {
  from: CurrencyConversionType
  to: CurrencyConversionType
}) {
  const price = useAppSelector(
    isBtcUsdConversion(from, to) ? selectBtcUsdPrice : () => undefined,
  )

  const conversionAmount = useMemo(() => {
    if (from.amount === undefined || !price) return undefined

    const { amount, currency } = from
    const { decimals } = CURRENCIES_BY_TYPE[currency]

    return bigIntToUserAmount(BigInt(amount), decimals, decimals - 1) * price
  }, [from, price])

  return conversionAmount
}

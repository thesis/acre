import React, { useMemo } from "react"
import { useSelector } from "react-redux"
import { selectBtcUsdPrice } from "#/store/btc"
import { bigIntToUserAmount } from "#/utils"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: CurrencyBalanceProps
  to: CurrencyBalanceProps
}) {
  const usdPrice = useSelector(selectBtcUsdPrice)
  const conversionAmount = useMemo(() => {
    if (!from.amount || BigInt(from.amount) < 0n) return undefined

    return (
      bigIntToUserAmount(BigInt(from.amount), 8) *
      bigIntToUserAmount(BigInt(usdPrice), 2)
    )
  }, [from.amount, usdPrice])

  return (
    <>
      <CurrencyBalance {...from} />
      <CurrencyBalance
        amount={conversionAmount}
        shouldBeFormatted={false}
        {...to}
      />
    </>
  )
}

import React, { useMemo } from "react"
import { selectBtcUsdPrice } from "#/store/btc/btc.selector"
import { useSelector } from "react-redux"
import { CurrencyBalance, CurrencyBalanceProps } from "../CurrencyBalance"

export function CurrencyBalanceWithConversion({
  from,
  to,
}: {
  from: CurrencyBalanceProps
  to: CurrencyBalanceProps
}) {
  const usdPrice = useSelector(selectBtcUsdPrice)
  // TODO: Make the correct conversion
  const conversionAmount = useMemo(() => {
    if (!from.amount || BigInt(from.amount) < 0n) return undefined

    return (from.amount as number) * usdPrice
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

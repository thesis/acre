const toLocaleString = (value: number): string =>
  value.toLocaleString("default", { maximumFractionDigits: 2 })

// Parse token amount by moving the decimal point
export function bigIntToUserAmount(
  amount: bigint,
  decimals = 18,
  desiredDecimals = 2,
): string {
  const desiredDecimalsAmount =
    amount / 10n ** BigInt(Math.max(1, decimals - desiredDecimals))

  const formattedAmount =
    Number(desiredDecimalsAmount) / 10 ** Math.min(desiredDecimals, decimals)
  const minAmountToDisplay = 10 ** (decimals - desiredDecimals)

  if (minAmountToDisplay > formattedAmount) {
    return `<0.${"0".repeat(desiredDecimals - 1)}1`
  }

  return toLocaleString(formattedAmount)
}
export const formatTokenAmount = (
  amount: number | string,
  decimals = 18,
  desiredDecimals = 2,
) => bigIntToUserAmount(BigInt(amount), decimals, desiredDecimals)

export const formatSatoshiAmount = (
  amount: number | string,
  desiredDecimals = 2,
) => formatTokenAmount(amount, 8, desiredDecimals)

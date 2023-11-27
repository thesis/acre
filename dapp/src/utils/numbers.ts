const toLocaleString = (value: number): string =>
  value.toLocaleString("default", { maximumFractionDigits: 2 })

/**
 * Convert a fixed point bigint with precision `fixedPointDecimals` to a
 * floating point number truncated to `desiredDecimals`.
 * If `formattedAmount` is less than the minimum amount to display
 * for the specified precision return information about this.
 *
 * This function is based on the solution used by the Taho extension.
 * More info: https://github.com/tahowallet/extension/blob/main/background/lib/fixed-point.ts#L216-L239
 */
export function bigIntToUserAmount(
  fixedPoint: bigint,
  fixedPointDecimals: number,
  desiredDecimals = 2,
): string {
  const fixedPointDesiredDecimalsAmount =
    fixedPoint /
    10n ** BigInt(Math.max(1, fixedPointDecimals - desiredDecimals))

  const formattedAmount =
    Number(fixedPointDesiredDecimalsAmount) /
    10 ** Math.min(desiredDecimals, fixedPointDecimals)
  const minAmountToDisplay =
    1 / 10 ** Math.min(desiredDecimals, fixedPointDecimals)

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

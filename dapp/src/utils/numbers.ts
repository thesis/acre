const toLocaleString = (value: number): string =>
  value.toLocaleString("default", { maximumFractionDigits: 2 })

/**
 * Convert a fixed point bigint with precision `fixedPointDecimals` to a
 * floating point number truncated to `desiredDecimals`.
 *
 * This function is based on the solution used by the Taho extension.
 * More info: https://github.com/tahowallet/extension/blob/main/background/lib/fixed-point.ts#L216-L239
 */
export function bigIntToUserAmount(
  fixedPoint: bigint,
  fixedPointDecimals: number,
  desiredDecimals = 2,
): number {
  const fixedPointDesiredDecimalsAmount =
    fixedPoint /
    10n ** BigInt(Math.max(1, fixedPointDecimals - desiredDecimals))

  const formattedAmount =
    Number(fixedPointDesiredDecimalsAmount) /
    10 ** Math.min(desiredDecimals, fixedPointDecimals)

  return formattedAmount
}

/**
 * Display a token amount correctly with desired decimals.
 * The function returns a string with a language-sensitive representation of this number.
 *
 * - If the amount entered is zero, return the result with the desired decimals.
 *   For example, 0.00 for a precision of 2.
 * - If `formattedAmount` is less than the minimum amount to display
 *  for the specified precision return information about this.
 *  For example, <0.01 for a precision of 2.
 *  - Other amounts are formatted according to the use of the `bigIntToUserAmount` function.
 *
 */
export const formatTokenAmount = (
  amount: number | string,
  decimals = 18,
  desiredDecimals = 2,
) => {
  const fixedPoint = BigInt(amount)

  if (fixedPoint === BigInt(0)) {
    return `0.${"0".repeat(desiredDecimals)}`
  }

  const formattedAmount = bigIntToUserAmount(
    fixedPoint,
    decimals,
    desiredDecimals,
  )
  const minAmountToDisplay = 1 / 10 ** Math.min(desiredDecimals, decimals)

  if (minAmountToDisplay > formattedAmount) {
    return `<0.${"0".repeat(desiredDecimals - 1)}1`
  }

  return toLocaleString(formattedAmount)
}

export const formatSatoshiAmount = (
  amount: number | string,
  desiredDecimals = 2,
) => formatTokenAmount(amount, 8, desiredDecimals)

/**
 * Converts a fixed point number with a bigint amount and a decimals field
 * indicating the orders of magnitude in `amount` behind the decimal point into
 * a string in US decimal format (no thousands separators, . for the decimal
 * separator).
 *
 * Used in cases where precision is critical.
 *
 * This function is based on the solution used by the Taho extension.
 * More info: https://github.com/tahowallet/extension/blob/main/background/lib/fixed-point.ts#L172-L214
 */
export function fixedPointNumberToString(
  amount: bigint,
  decimals: number,
  trimTrailingZeros = true,
): string {
  const undecimaledAmount = amount.toString()
  const preDecimalLength = undecimaledAmount.length - decimals

  const preDecimalCharacters =
    preDecimalLength > 0
      ? undecimaledAmount.substring(0, preDecimalLength)
      : "0"
  const postDecimalCharacters =
    "0".repeat(Math.max(-preDecimalLength, 0)) +
    undecimaledAmount.substring(preDecimalLength)

  const trimmedPostDecimalCharacters = trimTrailingZeros
    ? postDecimalCharacters.replace(/0*$/, "")
    : postDecimalCharacters

  const decimalString =
    trimmedPostDecimalCharacters.length > 0
      ? `.${trimmedPostDecimalCharacters}`
      : ""

  return `${preDecimalCharacters}${decimalString}`
}

export const BITCOIN_MIN_AMOUNT = "1000000" // 0.01 BTC

export const ERRORS = {
  REQUIRED: "Required.",
  EXCEEDED_VALUE: "The amount exceeds your current balance.",
  INSUFFICIENT_VALUE: (minValue: string) =>
    `The minimum amount must be at least ${minValue} BTC.`,
}

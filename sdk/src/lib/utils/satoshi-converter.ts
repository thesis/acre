const BTC_DECIMALS = 8n

// eslint-disable-next-line import/prefer-default-export
export function toSatoshi(amount: bigint, fromPrecision: bigint = 18n) {
  const SATOSHI_MULTIPLIER = 10n ** (fromPrecision - BTC_DECIMALS)

  const remainder = amount % SATOSHI_MULTIPLIER
  const satoshis = (amount - remainder) / SATOSHI_MULTIPLIER

  return satoshis
}

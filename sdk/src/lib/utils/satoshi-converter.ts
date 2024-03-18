/**
 * Multiplier to convert satoshi to 1e18 precision.
 */
const SATOSHI_MULTIPLIER = 10n ** 10n

export function toSatoshi(amount: bigint) {
  const remainder = amount % SATOSHI_MULTIPLIER
  const satoshis = (amount - remainder) / SATOSHI_MULTIPLIER

  return satoshis
}

export function fromSatoshi(amount: bigint) {
  return amount * SATOSHI_MULTIPLIER
}

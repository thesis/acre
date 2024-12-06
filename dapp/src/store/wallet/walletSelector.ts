import { RootState } from ".."

export const selectEstimatedBtcBalance = (state: RootState): bigint =>
  state.wallet.estimatedBtcBalance

export const selectSharesBalance = (state: RootState): bigint =>
  state.wallet.sharesBalance

export const selectIsSignedMessage = (state: RootState): boolean =>
  state.wallet.isSignedMessage

export const selectWalletAddress = (state: RootState): string | undefined =>
  state.wallet.address

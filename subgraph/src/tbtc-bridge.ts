import { getOrCreateWithdraw } from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleSubmitRedemptionProofCall(): void {
  // TODO: build withdraw id - redemption key + count.
  const id = ""
  const withdraw = getOrCreateWithdraw(id)
  // TODO: update the withdraw entity - update status and set the bitcoin
  // transacion hash.
}

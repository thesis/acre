import { RedemptionRequested } from "../generated/BitcoinRedeemer/BitcoinRedeemer"
import { getOrCreateWithdraw } from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleRedemptionRequested(event: RedemptionRequested): void {
  // TODO: build withdraw id - redemption key + count.
  const id = ""
  const withdraw = getOrCreateWithdraw(id)
  // TODO: set all properties of the withdraw entity.
}

import { RedemptionRequested } from "../generated/BitcoinRedeemer/BitcoinRedeemer"
import {
  getOrCreateDepositOwner,
  getOrCreateEvent,
  getOrCreateWithdraw,
} from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleRedemptionRequested(event: RedemptionRequested): void {
  const ownerEntity = getOrCreateDepositOwner(event.params.owner)
  // TODO: build withdraw id - redemption key + count.
  const id = ""
  const withdraw = getOrCreateWithdraw(id)
  // TODO: set all properties of the withdraw entity.
  withdraw.depositOwner = ownerEntity.id
  withdraw.amount = event.params.tbtcAmount

  const redemptionRequestedEvent = getOrCreateEvent(
    `${event.transaction.hash.toHexString()}_RedemptionRequested`,
  )
  redemptionRequestedEvent.activity = withdraw.id
  redemptionRequestedEvent.timestamp = event.block.timestamp
  redemptionRequestedEvent.type = "Initialized"

  withdraw.save()
  redemptionRequestedEvent.save()
}

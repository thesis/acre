import { ethereum, log } from "@graphprotocol/graph-ts"
import {
  getOrCreateDepositOwner,
  getOrCreateEvent,
  getOrCreateWithdraw,
} from "./utils"
import { RedemptionRequested } from "../generated/TbtcBridge/TbtcBridge"
import { buildRedemptionKey } from "./tbtc-utils"
import {
  getOwnerFromRedemptionRequestedLog,
  getRedemptionRequestedLog,
  getTbtcAmountFromRedemptionRequestedLog,
} from "./bitcoin-redeemer-utils"

export function handleRedemptionRequested(event: RedemptionRequested): void {
  const bitcoinRedeemerRedemptionRequestLog = getRedemptionRequestedLog(
    (event.receipt as ethereum.TransactionReceipt).logs,
  )

  if (!bitcoinRedeemerRedemptionRequestLog) {
    log.info("The redemption does not come from the Acre", [])
    return
  }

  const ownerId = getOwnerFromRedemptionRequestedLog(
    bitcoinRedeemerRedemptionRequestLog,
  )

  const ownerEntity = getOrCreateDepositOwner(ownerId)

  const redemptionKey = buildRedemptionKey(
    event.params.redeemerOutputScript,
    event.params.walletPubKeyHash,
  )

  const withdraw = getOrCreateWithdraw(redemptionKey)
  withdraw.depositOwner = ownerEntity.id
  const amount = getTbtcAmountFromRedemptionRequestedLog(
    bitcoinRedeemerRedemptionRequestLog,
  )
  withdraw.amount = amount

  const redemptionRequestedEvent = getOrCreateEvent(
    `${event.transaction.hash.toHexString()}_RedemptionRequested`,
  )
  redemptionRequestedEvent.activity = withdraw.id
  redemptionRequestedEvent.timestamp = event.block.timestamp
  redemptionRequestedEvent.type = "Initialized"

  ownerEntity.save()
  withdraw.save()
  redemptionRequestedEvent.save()
}

export function handleSubmitRedemptionProofCall(): void {
  // TODO: build withdraw id - redemption key + count.
  const id = ""
  const withdraw = getOrCreateWithdraw(id)
  // TODO: update the withdraw entity - update status and set the bitcoin
  // transacion hash.
}

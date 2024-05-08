import {
  DepositInitialized as DepositInitializedEvent,
  DepositFinalized as DepositFinalizedEvent,
} from "../generated/BitcoinDepositor/BitcoinDepositor"
import { Deposit } from "../generated/schema"
import {
  getOrCreateDepositOwner,
  getOrCreateDeposit,
  getOrCreateEvent,
} from "./utils"
import { findBitcoinTransactionIdFromTransactionReceipt } from "./tbtc-utils"

export function handleDepositInitialized(event: DepositInitializedEvent): void {
  const depositOwnerEntity = getOrCreateDepositOwner(event.params.depositOwner)
  const depositEntity = getOrCreateDeposit(
    event.params.depositKey.toHexString(),
  )

  depositEntity.depositOwner = depositOwnerEntity.id
  depositEntity.initialDepositAmount = event.params.initialAmount

  depositEntity.bitcoinTransactionId =
    findBitcoinTransactionIdFromTransactionReceipt(event.receipt)

  const eventEntity = getOrCreateEvent(
    `${event.transaction.hash.toHexString()}_DepositInitialized`,
  )

  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.type = "Initialized"

  depositOwnerEntity.save()
  depositEntity.save()
  eventEntity.save()
}

export function handleDepositFinalized(event: DepositFinalizedEvent): void {
  const depositEntity = Deposit.load(event.params.depositKey.toHexString())

  // We throw an error just to improve readability of the code. This should
  // never happen because the graph indexes events chronologically and the
  // deposit can only be finalized once it has been initialized. This case is
  // possible when we set the wrong `startBlock` in manifest but we always set
  // the `startBlock` to block where a given contract was deployed.
  if (!depositEntity) {
    throw new Error("Deposit entity does not exist")
  }

  depositEntity.bridgedAmount = event.params.bridgedAmount
  depositEntity.depositorFee = event.params.depositorFee
  depositEntity.amountToDeposit = event.params.bridgedAmount.minus(
    event.params.depositorFee,
  )
  depositEntity.referral = event.params.referral

  const eventEntity = getOrCreateEvent(
    `${event.transaction.hash.toHexString()}_DepositFinalized`,
  )

  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.type = "Finalized"

  depositEntity.save()
  eventEntity.save()
}

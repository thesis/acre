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

export function handleDepositInitialized(event: DepositInitializedEvent): void {
  const depositOwnerEntity = getOrCreateDepositOwner(event.params.depositOwner)
  const depositEntity = getOrCreateDeposit(
    event.params.depositKey.toHexString(),
  )

  // TODO: get the bitcoin transaction hash from this Ethereum transaction
  // by finding the DepositRevealed event in logs from the tBTC-v2 Bridge contract.
  depositEntity.depositOwner = depositOwnerEntity.id
  depositEntity.initialDepositAmount = event.params.initialAmount

  const eventEntity = getOrCreateEvent(event.transaction.hash.toHexString())

  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.type = "Initialized"

  depositOwnerEntity.save()
  depositEntity.save()
  eventEntity.save()
}

export function handleDepositFinalized(event: DepositFinalizedEvent): void {
  const depositEntity = Deposit.load(event.params.depositKey.toHexString())

  if (!depositEntity) {
    throw new Error("Deposit entity does not exist")
  }

  depositEntity.initialDepositAmount = event.params.initialAmount
  depositEntity.amountToDeposit = event.params.bridgedAmount

  const eventEntity = getOrCreateEvent(event.transaction.hash.toHexString())

  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.type = "Finalized"

  depositEntity.save()
  eventEntity.save()
}

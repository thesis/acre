import {
  DepositInitialized as DepositInitializedEvent,
  DepositFinalized as DepositFinalizedEvent,
} from "../generated/BitcoinDepositor/BitcoinDepositor"
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

  depositEntity.depositOwner = depositOwnerEntity.id
  depositEntity.initialDepositAmount = event.params.initialAmount

  const eventEntity = getOrCreateEvent(event.transaction.hash.toHexString())

  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.amount = event.params.initialAmount

  depositOwnerEntity.save()
  depositEntity.save()
  eventEntity.save()
}

export function handleDepositFinalized(event: DepositFinalizedEvent): void {
  const depositEntity = getOrCreateDeposit(
    event.params.depositKey.toHexString(),
  )

  depositEntity.initialDepositAmount = event.params.initialAmount
  depositEntity.amountToDeposit = event.params.bridgedAmount

  const eventEntity = getOrCreateEvent(event.transaction.hash.toHexString())
  eventEntity.activity = depositEntity.id
  eventEntity.timestamp = event.block.timestamp
  eventEntity.amount = event.params.initialAmount

  depositEntity.save()
  eventEntity.save()
}

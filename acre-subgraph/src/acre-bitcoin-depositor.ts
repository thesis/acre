import {
  BridgingCompleted as BridgingCompletedEvent,
  DepositFinalized as DepositFinalizedEvent,
  DepositInitialized as DepositInitializedEvent,
  DepositorFeeDivisorUpdated as DepositorFeeDivisorUpdatedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  StakeRequestCancelledFromQueue as StakeRequestCancelledFromQueueEvent,
  StakeRequestFinalized as StakeRequestFinalizedEvent,
  StakeRequestFinalizedFromQueue as StakeRequestFinalizedFromQueueEvent,
  StakeRequestInitialized as StakeRequestInitializedEvent,
  StakeRequestQueued as StakeRequestQueuedEvent
} from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"
import {
  BridgingCompleted,
  DepositFinalized,
  DepositInitialized,
  DepositorFeeDivisorUpdated,
  OwnershipTransferStarted,
  OwnershipTransferred,
  StakeRequestCancelledFromQueue,
  StakeRequestFinalized,
  StakeRequestFinalizedFromQueue,
  StakeRequestInitialized,
  StakeRequestQueued
} from "../generated/schema"

export function handleBridgingCompleted(event: BridgingCompletedEvent): void {
  let entity = new BridgingCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.referral = event.params.referral
  entity.bridgedAmount = event.params.bridgedAmount
  entity.depositorFee = event.params.depositorFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositFinalized(event: DepositFinalizedEvent): void {
  let entity = new DepositFinalized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.tbtcAmount = event.params.tbtcAmount
  entity.finalizedAt = event.params.finalizedAt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositInitialized(event: DepositInitializedEvent): void {
  let entity = new DepositInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.initializedAt = event.params.initializedAt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDepositorFeeDivisorUpdated(
  event: DepositorFeeDivisorUpdatedEvent
): void {
  let entity = new DepositorFeeDivisorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositorFeeDivisor = event.params.depositorFeeDivisor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeRequestCancelledFromQueue(
  event: StakeRequestCancelledFromQueueEvent
): void {
  let entity = new StakeRequestCancelledFromQueue(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.staker = event.params.staker
  entity.amountToStake = event.params.amountToStake

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeRequestFinalized(
  event: StakeRequestFinalizedEvent
): void {
  let entity = new StakeRequestFinalized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.stakedAmount = event.params.stakedAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeRequestFinalizedFromQueue(
  event: StakeRequestFinalizedFromQueueEvent
): void {
  let entity = new StakeRequestFinalizedFromQueue(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.stakedAmount = event.params.stakedAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeRequestInitialized(
  event: StakeRequestInitializedEvent
): void {
  let entity = new StakeRequestInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.staker = event.params.staker

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakeRequestQueued(event: StakeRequestQueuedEvent): void {
  let entity = new StakeRequestQueued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.queuedAmount = event.params.queuedAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

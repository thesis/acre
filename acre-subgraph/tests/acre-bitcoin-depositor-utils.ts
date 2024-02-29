import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"

export function createBridgingCompletedEvent(
  depositKey: BigInt,
  caller: Address,
  referral: i32,
  bridgedAmount: BigInt,
  depositorFee: BigInt
): BridgingCompleted {
  let bridgingCompletedEvent = changetype<BridgingCompleted>(newMockEvent())

  bridgingCompletedEvent.parameters = new Array()

  bridgingCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  bridgingCompletedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  bridgingCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "referral",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(referral))
    )
  )
  bridgingCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "bridgedAmount",
      ethereum.Value.fromUnsignedBigInt(bridgedAmount)
    )
  )
  bridgingCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "depositorFee",
      ethereum.Value.fromUnsignedBigInt(depositorFee)
    )
  )

  return bridgingCompletedEvent
}

export function createDepositFinalizedEvent(
  depositKey: BigInt,
  tbtcAmount: BigInt,
  finalizedAt: BigInt
): DepositFinalized {
  let depositFinalizedEvent = changetype<DepositFinalized>(newMockEvent())

  depositFinalizedEvent.parameters = new Array()

  depositFinalizedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  depositFinalizedEvent.parameters.push(
    new ethereum.EventParam(
      "tbtcAmount",
      ethereum.Value.fromUnsignedBigInt(tbtcAmount)
    )
  )
  depositFinalizedEvent.parameters.push(
    new ethereum.EventParam(
      "finalizedAt",
      ethereum.Value.fromUnsignedBigInt(finalizedAt)
    )
  )

  return depositFinalizedEvent
}

export function createDepositInitializedEvent(
  depositKey: BigInt,
  initializedAt: BigInt
): DepositInitialized {
  let depositInitializedEvent = changetype<DepositInitialized>(newMockEvent())

  depositInitializedEvent.parameters = new Array()

  depositInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  depositInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "initializedAt",
      ethereum.Value.fromUnsignedBigInt(initializedAt)
    )
  )

  return depositInitializedEvent
}

export function createDepositorFeeDivisorUpdatedEvent(
  depositorFeeDivisor: BigInt
): DepositorFeeDivisorUpdated {
  let depositorFeeDivisorUpdatedEvent = changetype<DepositorFeeDivisorUpdated>(
    newMockEvent()
  )

  depositorFeeDivisorUpdatedEvent.parameters = new Array()

  depositorFeeDivisorUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "depositorFeeDivisor",
      ethereum.Value.fromUnsignedBigInt(depositorFeeDivisor)
    )
  )

  return depositorFeeDivisorUpdatedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent = changetype<OwnershipTransferStarted>(
    newMockEvent()
  )

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createStakeRequestCancelledFromQueueEvent(
  depositKey: BigInt,
  staker: Address,
  amountToStake: BigInt
): StakeRequestCancelledFromQueue {
  let stakeRequestCancelledFromQueueEvent =
    changetype<StakeRequestCancelledFromQueue>(newMockEvent())

  stakeRequestCancelledFromQueueEvent.parameters = new Array()

  stakeRequestCancelledFromQueueEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  stakeRequestCancelledFromQueueEvent.parameters.push(
    new ethereum.EventParam("staker", ethereum.Value.fromAddress(staker))
  )
  stakeRequestCancelledFromQueueEvent.parameters.push(
    new ethereum.EventParam(
      "amountToStake",
      ethereum.Value.fromUnsignedBigInt(amountToStake)
    )
  )

  return stakeRequestCancelledFromQueueEvent
}

export function createStakeRequestFinalizedEvent(
  depositKey: BigInt,
  caller: Address,
  stakedAmount: BigInt
): StakeRequestFinalized {
  let stakeRequestFinalizedEvent = changetype<StakeRequestFinalized>(
    newMockEvent()
  )

  stakeRequestFinalizedEvent.parameters = new Array()

  stakeRequestFinalizedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  stakeRequestFinalizedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  stakeRequestFinalizedEvent.parameters.push(
    new ethereum.EventParam(
      "stakedAmount",
      ethereum.Value.fromUnsignedBigInt(stakedAmount)
    )
  )

  return stakeRequestFinalizedEvent
}

export function createStakeRequestFinalizedFromQueueEvent(
  depositKey: BigInt,
  caller: Address,
  stakedAmount: BigInt
): StakeRequestFinalizedFromQueue {
  let stakeRequestFinalizedFromQueueEvent =
    changetype<StakeRequestFinalizedFromQueue>(newMockEvent())

  stakeRequestFinalizedFromQueueEvent.parameters = new Array()

  stakeRequestFinalizedFromQueueEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  stakeRequestFinalizedFromQueueEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  stakeRequestFinalizedFromQueueEvent.parameters.push(
    new ethereum.EventParam(
      "stakedAmount",
      ethereum.Value.fromUnsignedBigInt(stakedAmount)
    )
  )

  return stakeRequestFinalizedFromQueueEvent
}

export function createStakeRequestInitializedEvent(
  depositKey: BigInt,
  caller: Address,
  staker: Address
): StakeRequestInitialized {
  let stakeRequestInitializedEvent = changetype<StakeRequestInitialized>(
    newMockEvent()
  )

  stakeRequestInitializedEvent.parameters = new Array()

  stakeRequestInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  stakeRequestInitializedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  stakeRequestInitializedEvent.parameters.push(
    new ethereum.EventParam("staker", ethereum.Value.fromAddress(staker))
  )

  return stakeRequestInitializedEvent
}

export function createStakeRequestQueuedEvent(
  depositKey: BigInt,
  caller: Address,
  queuedAmount: BigInt
): StakeRequestQueued {
  let stakeRequestQueuedEvent = changetype<StakeRequestQueued>(newMockEvent())

  stakeRequestQueuedEvent.parameters = new Array()

  stakeRequestQueuedEvent.parameters.push(
    new ethereum.EventParam(
      "depositKey",
      ethereum.Value.fromUnsignedBigInt(depositKey)
    )
  )
  stakeRequestQueuedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )
  stakeRequestQueuedEvent.parameters.push(
    new ethereum.EventParam(
      "queuedAmount",
      ethereum.Value.fromUnsignedBigInt(queuedAmount)
    )
  )

  return stakeRequestQueuedEvent
}

import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/defaults"
import {
  DepositInitialized,
  DepositFinalized,
} from "../generated/BitcoinDepositor/BitcoinDepositor"

export function createDepositInitializedEvent(
  depositKey: BigInt,
  caller: Address,
  depositOwner: Address,
  initialAmount: BigInt,
): DepositInitialized {
  const depositInitializedEvent = changetype<DepositInitialized>(newMockEvent())

  depositInitializedEvent.parameters = []

  const depositKeyParam = new ethereum.EventParam(
    "depositKey",
    ethereum.Value.fromUnsignedBigInt(depositKey),
  )
  const callerParam = new ethereum.EventParam(
    "caller",
    ethereum.Value.fromAddress(caller),
  )

  const depositOwnerParam = new ethereum.EventParam(
    "depositOwner",
    ethereum.Value.fromAddress(depositOwner),
  )

  const initialAmountParam = new ethereum.EventParam(
    "initialAmount",
    ethereum.Value.fromUnsignedBigInt(initialAmount),
  )

  depositInitializedEvent.parameters.push(depositKeyParam)
  depositInitializedEvent.parameters.push(callerParam)
  depositInitializedEvent.parameters.push(depositOwnerParam)
  depositInitializedEvent.parameters.push(initialAmountParam)

  return depositInitializedEvent
}

export function createDepositFinalizedEvent(
  depositKey: BigInt,
  caller: Address,
  depositOwner: Address,
  referral: BigInt,
  initialAmount: BigInt,
  bridgedAmount: BigInt,
  depositorFee: BigInt,
): DepositFinalized {
  const depositFinalizedEvent = changetype<DepositFinalized>(newMockEvent())

  depositFinalizedEvent.parameters = []

  const depositKeyParam = new ethereum.EventParam(
    "depositKey",
    ethereum.Value.fromUnsignedBigInt(depositKey),
  )
  const callerParam = new ethereum.EventParam(
    "caller",
    ethereum.Value.fromAddress(caller),
  )

  const depositOwnerParam = new ethereum.EventParam(
    "depositOwner",
    ethereum.Value.fromAddress(depositOwner),
  )

  const referralParam = new ethereum.EventParam(
    "referral",
    ethereum.Value.fromUnsignedBigInt(referral),
  )

  const initialAmountParam = new ethereum.EventParam(
    "initialAmount",
    ethereum.Value.fromUnsignedBigInt(initialAmount),
  )

  const bridgedAmountParam = new ethereum.EventParam(
    "bridgedAmount",
    ethereum.Value.fromUnsignedBigInt(bridgedAmount),
  )

  const depositorFeeParam = new ethereum.EventParam(
    "depositorFee",
    ethereum.Value.fromUnsignedBigInt(depositorFee),
  )

  depositFinalizedEvent.parameters.push(depositKeyParam)
  depositFinalizedEvent.parameters.push(callerParam)
  depositFinalizedEvent.parameters.push(depositOwnerParam)
  depositFinalizedEvent.parameters.push(referralParam)
  depositFinalizedEvent.parameters.push(initialAmountParam)
  depositFinalizedEvent.parameters.push(bridgedAmountParam)
  depositFinalizedEvent.parameters.push(depositorFeeParam)

  return depositFinalizedEvent
}

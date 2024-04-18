import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/defaults"
import { DepositInitialized } from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"

// eslint-disable-next-line import/prefer-default-export
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

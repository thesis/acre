import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/defaults"
import { StakeRequestInitialized } from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"

// eslint-disable-next-line import/prefer-default-export
export function createStakeRequestInitializedEvent(
  depositKey: BigInt,
  caller: Address,
  staker: Address,
  initialAmount: BigInt,
): StakeRequestInitialized {
  const stakeRequestInitializedEvent =
    changetype<StakeRequestInitialized>(newMockEvent())

  stakeRequestInitializedEvent.parameters = []

  const depositKeyParam = new ethereum.EventParam(
    "depositKey",
    ethereum.Value.fromUnsignedBigInt(depositKey),
  )
  const callerParam = new ethereum.EventParam(
    "caller",
    ethereum.Value.fromAddress(caller),
  )

  const stakerParam = new ethereum.EventParam(
    "staker",
    ethereum.Value.fromAddress(staker),
  )

  const initialAmountParam = new ethereum.EventParam(
    "initialAmount",
    ethereum.Value.fromUnsignedBigInt(initialAmount),
  )

  stakeRequestInitializedEvent.parameters.push(depositKeyParam)
  stakeRequestInitializedEvent.parameters.push(callerParam)
  stakeRequestInitializedEvent.parameters.push(stakerParam)
  stakeRequestInitializedEvent.parameters.push(initialAmountParam)

  return stakeRequestInitializedEvent
}

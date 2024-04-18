import { DepositInitialized as DepositInitializedEvent } from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"
import {
  getOrCreateDepositOwner,
  getOrCreateStake,
  getOrCreateLog,
} from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleDepositInitialized(event: DepositInitializedEvent): void {
  const depositOwnerEntity = getOrCreateDepositOwner(event.params.depositOwner)
  const stakeEntity = getOrCreateStake(event.transaction.hash.toHexString())

  stakeEntity.depositOwner = depositOwnerEntity.id
  stakeEntity.initialDepositAmountSatoshi = event.params.initialAmount

  const logDataBtc = getOrCreateLog(
    `${event.transaction.hash.toHexString()}btc`,
  )
  const logDataEth = getOrCreateLog(
    `${event.transaction.hash.toHexString()}eth`,
  )

  logDataBtc.activity = stakeEntity.id

  // This timestamp may be different than the actual time
  // when the BTC transaction took place:
  // It indicates when Ethereum received event about this BTC deposit,
  // not when the BTC transaction happened.
  logDataBtc.timestamp = event.block.timestamp
  logDataBtc.chain = "Bitcoin"
  logDataBtc.amount = event.params.initialAmount

  logDataEth.activity = stakeEntity.id
  logDataEth.timestamp = event.block.timestamp
  logDataEth.chain = "Ethereum"
  logDataEth.amount = event.params.initialAmount

  depositOwnerEntity.save()
  stakeEntity.save()
  logDataBtc.save()
  logDataEth.save()
}

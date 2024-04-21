import {
  DepositInitialized as DepositInitializedEvent,
  DepositFinalized as DepositFinalizedEvent,
} from "../generated/BitcoinDepositor/BitcoinDepositor"
import {
  getOrCreateDepositOwner,
  getOrCreateDeposit,
  getOrCreateLog,
} from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleDepositInitialized(event: DepositInitializedEvent): void {
  const depositOwnerEntity = getOrCreateDepositOwner(event.params.depositOwner)
  const depositEntity = getOrCreateDeposit(
    event.params.depositKey.toHexString(),
  )

  depositEntity.depositOwner = depositOwnerEntity.id
  depositEntity.initialDepositAmountSatoshi = event.params.initialAmount

  const logDataBtc = getOrCreateLog(
    `${event.transaction.hash.toHexString()}btc`,
  )
  const logDataEth = getOrCreateLog(
    `${event.transaction.hash.toHexString()}eth`,
  )

  logDataBtc.activity = depositEntity.id

  // This timestamp may be different than the actual time
  // when the BTC transaction took place:
  // It indicates when Ethereum received event about this BTC deposit,
  // not when the BTC transaction happened.
  logDataBtc.timestamp = event.block.timestamp
  logDataBtc.chain = "Bitcoin"
  logDataBtc.amount = event.params.initialAmount

  logDataEth.activity = depositEntity.id
  logDataEth.timestamp = event.block.timestamp
  logDataEth.chain = "Ethereum"
  logDataEth.amount = event.params.initialAmount

  depositOwnerEntity.save()
  depositEntity.save()
  logDataBtc.save()
  logDataEth.save()
}

export function handleDepositFinalized(event: DepositFinalizedEvent): void {
  const depositOwnerEntity = getOrCreateDepositOwner(event.params.depositOwner)
  const depositEntity = getOrCreateDeposit(
    event.params.depositKey.toHexString(),
  )

  depositEntity.depositOwner = depositOwnerEntity.id
  depositEntity.initialDepositAmountSatoshi = event.params.initialAmount
  depositEntity.amountToDepositStBtc = event.params.bridgedAmount

  const logDataBtc = getOrCreateLog(
    `${event.transaction.hash.toHexString()}btc`,
  )
  const logDataEth = getOrCreateLog(
    `${event.transaction.hash.toHexString()}eth`,
  )

  logDataBtc.activity = depositEntity.id

  // This timestamp may be different than the actual time
  // when the BTC transaction took place:
  // It indicates when Ethereum received event about this BTC deposit,
  // not when the BTC transaction happened.
  logDataBtc.timestamp = event.block.timestamp
  logDataBtc.chain = "Bitcoin"
  logDataBtc.amount = event.params.initialAmount

  logDataEth.activity = depositEntity.id
  logDataEth.timestamp = event.block.timestamp
  logDataEth.chain = "Ethereum"
  logDataEth.amount = event.params.initialAmount

  depositOwnerEntity.save()
  depositEntity.save()
  logDataBtc.save()
  logDataEth.save()
}

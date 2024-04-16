import { StakeRequestInitialized as StakeRequestInitializedEvent } from "../generated/AcreBitcoinDepositor/AcreBitcoinDepositor"
import { Stake, StakeRequestInitialized } from "../generated/schema"
import { getOrCreateStaker, getOrCreateLog } from "./utils"

// eslint-disable-next-line import/prefer-default-export
export function handleStakeRequestInitialized(
  event: StakeRequestInitializedEvent,
): void {
  const entity = new StakeRequestInitialized(
    event.transaction.hash.toHexString(),
  )
  const stakeEntity = new Stake(event.transaction.hash.toHexString())
  const stakerEntity = getOrCreateStaker(event.params.staker)

  const logDataBtc = getOrCreateLog(
    `${event.transaction.hash.toHexString()}btc`,
  )
  const logDataEth = getOrCreateLog(
    `${event.transaction.hash.toHexString()}eth`,
  )

  logDataBtc.activity = stakeEntity.id
  logDataBtc.timestamp = event.block.timestamp
  logDataBtc.chain = "Bitcoin"
  logDataBtc.amount = event.params.initialAmount

  logDataEth.activity = stakeEntity.id
  logDataEth.timestamp = event.block.timestamp
  logDataEth.chain = "Ethereum"
  logDataEth.amount = event.params.initialAmount

  entity.depositKey = event.params.depositKey
  entity.caller = event.params.caller
  entity.staker = event.params.staker

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  stakerEntity.save()
  logDataBtc.save()
  logDataEth.save()
  entity.save()
}

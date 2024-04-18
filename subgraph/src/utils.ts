import { Address } from "@graphprotocol/graph-ts"
import { Staker, LogData, Stake } from "../generated/schema"

export function getOrCreateStaker(stakerId: Address): Staker {
  const stakerHexString = stakerId.toHexString()
  let staker = Staker.load(stakerHexString)

  if (!staker) {
    staker = new Staker(stakerHexString)
  }

  return staker
}

export function getOrCreateStake(transactionId: string): Stake {
  // const stakeHexString = transactionHash.toHexString()
  let stake = Stake.load(transactionId)

  if (!stake) {
    stake = new Stake(transactionId)
  }

  return stake
}

export function getOrCreateLog(logId: string): LogData {
  let log = LogData.load(logId)

  if (!log) {
    log = new LogData(logId)
  }

  return log
}

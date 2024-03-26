import { Address } from "@graphprotocol/graph-ts"
import { Staker, LogData } from "../generated/schema"

export function getOrCreateStaker(stakerId: Address): Staker {
  const stakerHexString = stakerId.toHexString()
  let staker = Staker.load(stakerHexString)

  if (!staker) {
    staker = new Staker(stakerHexString)
  }

  return staker
}

export function getOrCreateLog(logId: string): LogData {
  let log = LogData.load(logId)

  if (!log) {
    log = new LogData(logId)
  }

  return log
}

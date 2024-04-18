import { Address } from "@graphprotocol/graph-ts"
import { DepositOwner, LogData, Stake } from "../generated/schema"

export function getOrCreateDepositOwner(depositOwnerId: Address): DepositOwner {
  const depositOwnerHexString = depositOwnerId.toHexString()
  let depositOwner = DepositOwner.load(depositOwnerHexString)

  if (!depositOwner) {
    depositOwner = new DepositOwner(depositOwnerHexString)
  }

  return depositOwner
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

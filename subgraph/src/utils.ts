import { Address } from "@graphprotocol/graph-ts"
import { DepositOwner, LogData, Deposit } from "../generated/schema"

export function getOrCreateDepositOwner(depositOwnerId: Address): DepositOwner {
  const depositOwnerHexString = depositOwnerId.toHexString()
  let depositOwner = DepositOwner.load(depositOwnerHexString)

  if (!depositOwner) {
    depositOwner = new DepositOwner(depositOwnerHexString)
  }

  return depositOwner
}

export function getOrCreateDeposit(transactionId: string): Deposit {
  let deposit = Deposit.load(transactionId)

  if (!deposit) {
    deposit = new Deposit(transactionId)
  }

  return deposit
}

export function getOrCreateLog(logId: string): LogData {
  let log = LogData.load(logId)

  if (!log) {
    log = new LogData(logId)
  }

  return log
}

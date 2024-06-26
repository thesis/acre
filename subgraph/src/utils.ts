import { Address, ByteArray, ethereum } from "@graphprotocol/graph-ts"
import { DepositOwner, Deposit, Event, Withdraw } from "../generated/schema"

export function getOrCreateDepositOwner(depositOwnerId: Address): DepositOwner {
  const depositOwnerHexString = depositOwnerId.toHexString()
  let depositOwner = DepositOwner.load(depositOwnerHexString)

  if (!depositOwner) {
    depositOwner = new DepositOwner(depositOwnerHexString)
  }

  return depositOwner
}

export function getOrCreateDeposit(depositKey: string): Deposit {
  let deposit = Deposit.load(depositKey)

  if (!deposit) {
    deposit = new Deposit(depositKey)
  }

  return deposit
}

export function getOrCreateEvent(eventId: string): Event {
  let event = Event.load(eventId)

  if (!event) {
    event = new Event(eventId)
  }

  return event
}

export function getOrCreateWithdraw(id: string): Withdraw {
  let withdrawEntity = Withdraw.load(id)

  if (!withdrawEntity) {
    withdrawEntity = new Withdraw(id)
  }

  return withdrawEntity
}

export function findLogByEventSignatureInLogs(
  logs: ethereum.Log[],
  eventSignature: ByteArray,
  contractAddress: Address,
): ethereum.Log {
  let logIndex = -1
  for (let i = 0; i < logs.length; i += 1) {
    const receiptLog = logs[i]

    if (
      receiptLog.address.equals(contractAddress) &&
      receiptLog.topics[0].equals(eventSignature)
    ) {
      logIndex = i
    }
  }

  if (logIndex < 0) {
    throw new Error(
      `Cannot find event (signature: ${eventSignature.toHexString()}) in transaction logs`,
    )
  }

  return logs[logIndex]
}

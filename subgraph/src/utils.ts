import { Address, BigInt, ByteArray, ethereum } from "@graphprotocol/graph-ts"
import {
  DepositOwner,
  Deposit,
  Event,
  Withdraw,
  RedemptionKeyCounter,
} from "../generated/schema"

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

export function getOrCreateRedemptionKeyCounter(
  redemptionKey: string,
): RedemptionKeyCounter {
  let redemptionKeyCounter = RedemptionKeyCounter.load(redemptionKey)

  if (!redemptionKeyCounter) {
    redemptionKeyCounter = new RedemptionKeyCounter(redemptionKey)
    redemptionKeyCounter.counter = BigInt.zero()
  }

  return redemptionKeyCounter
}

function buildWithdrawId(redemptionKey: string, counter: BigInt): string {
  return redemptionKey.concat("-").concat(counter.toString())
}

export function getLastWithdrawId(redemptionKey: string): string {
  const redemptionKeyCounter = getOrCreateRedemptionKeyCounter(redemptionKey)

  return buildWithdrawId(redemptionKey, redemptionKeyCounter.counter)
}

export function getNextWithdrawId(redemptionKey: string): string {
  const redemptionKeyCounter = getOrCreateRedemptionKeyCounter(redemptionKey)

  return buildWithdrawId(
    redemptionKey,
    redemptionKeyCounter.counter.plus(BigInt.fromI32(1)),
  )
}

export function getOrCreateWithdraw(id: string): Withdraw {
  let withdraw = Withdraw.load(id)
  if (!withdraw) {
    withdraw = new Withdraw(id)
  }

  return withdraw
}

export function getLogByEventSignatureInLogs(
  logs: ethereum.Log[],
  eventSignature: ByteArray,
  contractAddress: Address,
): ethereum.Log | null {
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
    return null
  }

  return logs[logIndex]
}

export function findLogByEventSignatureInLogs(
  logs: ethereum.Log[],
  eventSignature: ByteArray,
  contractAddress: Address,
): ethereum.Log {
  const log = getLogByEventSignatureInLogs(
    logs,
    eventSignature,
    contractAddress,
  )

  if (!log) {
    throw new Error(
      `Cannot find event (signature: ${eventSignature.toHexString()}) in transaction logs`,
    )
  }

  return log
}

import {
  Address,
  dataSource,
  ethereum,
  crypto,
  ByteArray,
  BigInt,
} from "@graphprotocol/graph-ts"
import { getLogByEventSignatureInLogs } from "./utils"

const REDEMPTION_REQUESTED_EVENT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8("RedemptionRequested(address,uint256,uint256)"),
)

export function getRedemptionRequestedLog(
  logs: ethereum.Log[],
): ethereum.Log | null {
  const bitcoinRedeemerAddress = Address.fromBytes(
    dataSource.context().getBytes("bitcoinRedeemerAddress"),
  )

  return getLogByEventSignatureInLogs(
    logs,
    REDEMPTION_REQUESTED_EVENT_SIGNATURE,
    bitcoinRedeemerAddress,
  )
}
export function getOwnerFromRedemptionRequestedLog(log: ethereum.Log): Address {
  // The owner address is first indexed param.
  return ethereum.decode("address", log.topics[1])!.toAddress()
}

export function getTbtcAmountFromRedemptionRequestedLog(
  log: ethereum.Log,
): BigInt {
  const decoded = ethereum.decode("(uint256,uint256)", log.data)!.toTuple()

  return decoded[1].toBigInt()
}

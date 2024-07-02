import {
  Address,
  ethereum,
  crypto,
  ByteArray,
  BigInt,
  Bytes,
  dataSource,
} from "@graphprotocol/graph-ts"
import { findLogByEventSignatureInLogs } from "./utils"

const DEPOSIT_REVEALED_EVENT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "DepositRevealed(bytes32,uint32,address,uint64,bytes8,bytes20,bytes20,bytes4,address)",
  ),
)

export function toBitcoinTxId(bitcoinTxHash: string): string {
  // Bitcoin transaction id in the same byte order as used by the
  // Bitcoin block explorers.
  const bitcoinTransactionId = BigInt.fromUnsignedBytes(
    Bytes.fromHexString(bitcoinTxHash),
  )
    .toHexString()
    .slice(2)

  return bitcoinTransactionId
}

export function findBitcoinTransactionIdFromTransactionReceipt(
  transactionReceipt: ethereum.TransactionReceipt | null,
): string {
  const tbtcV2BridgeAddress = Address.fromBytes(
    dataSource.context().getBytes("tbtcBridgeAddress"),
  )

  if (!transactionReceipt) {
    throw new Error("Transaction receipt not available")
  }

  // We must cast manually to `ethereum.TransactionReceipt` otherwise
  // AssemblyScript will fail.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const receipt = transactionReceipt as ethereum.TransactionReceipt

  const depositRevealedLog = findLogByEventSignatureInLogs(
    receipt.logs,
    DEPOSIT_REVEALED_EVENT_SIGNATURE,
    tbtcV2BridgeAddress,
  )

  // Bitcoin transaction hash in little-endian byte order. The first 32 bytes
  // (w/o `0x` prefix) points to the Bitcoin transaction hash.
  const bitcoinTxHash = depositRevealedLog.data.toHexString().slice(2, 66)

  return toBitcoinTxId(bitcoinTxHash)
}

/**
 * keccak256(keccak256(redeemerOutputScript) | walletPubKeyHash)
 * */
export function buildRedemptionKey(
  redeemerOutputScript: ByteArray,
  walletPublicKeyHash: ByteArray,
): string {
  const scriptHashArray = crypto.keccak256(redeemerOutputScript)
  const data = new Uint8Array(
    scriptHashArray.length + walletPublicKeyHash.length,
  )

  data.set(scriptHashArray, 0)
  data.set(walletPublicKeyHash, scriptHashArray.length)

  return crypto.keccak256(Bytes.fromUint8Array(data)).toHexString()
}

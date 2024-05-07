import {
  Address,
  ethereum,
  crypto,
  ByteArray,
  BigInt,
  Bytes,
  dataSource,
} from "@graphprotocol/graph-ts"

const DEPOSIT_REVEALED_EVENT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "DepositRevealed(bytes32,uint32,address,uint64,bytes8,bytes20,bytes20,bytes4,address)",
  ),
)

// eslint-disable-next-line import/prefer-default-export
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

  let depositRevealedLogIndex = -1
  for (let i = 0; i < receipt.logs.length; i += 1) {
    const receiptLog = receipt.logs[i]

    if (
      receiptLog.address.equals(tbtcV2BridgeAddress) &&
      receiptLog.topics[0].equals(DEPOSIT_REVEALED_EVENT_SIGNATURE)
    ) {
      depositRevealedLogIndex = i
    }
  }

  if (depositRevealedLogIndex < 0) {
    throw new Error("Cannot find `DepositRevealed` event in transaction logs")
  }

  const depositRevealedLog = receipt.logs[depositRevealedLogIndex]

  // Bitcoin transaction hash in little-endian byte order. The first 32 bytes
  // (w/o `0x` prefix) points to the Bitcoin transaction hash.
  const bitcoinTxHash = depositRevealedLog.data.toHexString().slice(2, 66)

  // Bitcoin transaction id in the same byte order as used by the
  // Bitcoin block explorers.
  const bitcoinTransactionId = BigInt.fromUnsignedBytes(
    Bytes.fromHexString(bitcoinTxHash),
  )
    .toHexString()
    .slice(2)

  return bitcoinTransactionId
}

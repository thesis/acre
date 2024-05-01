import {
  Address,
  ethereum,
  crypto,
  ByteArray,
  BigInt,
  Bytes,
} from "@graphprotocol/graph-ts"

const DEPOSIT_REVEALED_EVENT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "DepositRevealed(bytes32,uint32,address,uint64,bytes8,bytes20,bytes20,bytes4,address)",
  ),
)

// TODO: Set correct address for mainnet.
const TBTC_V2_BRIDGE_CONTRACT_ADDRESS = Address.fromString(
  "0x9b1a7fE5a16A15F2f9475C5B231750598b113403",
)

// eslint-disable-next-line import/prefer-default-export
export function findBitcoinTransactionIdFromTransactionReceipt(
  transactionReceipt: ethereum.TransactionReceipt | null,
): string {
  if (!transactionReceipt) {
    throw new Error("Transaction receipt not available")
  }

  // We must cast manually to `ethereum.TransactionReceipt` otherwise
  // AssemblyScript will fail.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const receipt = transactionReceipt as ethereum.TransactionReceipt

  const depositRevealedLogIndex = receipt.logs.findIndex(
    (receiptLog) =>
      receiptLog.address.equals(TBTC_V2_BRIDGE_CONTRACT_ADDRESS) &&
      receiptLog.topics[0].equals(DEPOSIT_REVEALED_EVENT_SIGNATURE),
  )

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

import {
  ethereum,
  BigInt,
  Address,
  Bytes,
  Wrapped,
} from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as/assembly/defaults"
import {
  DepositInitialized,
  DepositFinalized,
} from "../generated/BitcoinDepositor/BitcoinDepositor"

export function createDepositInitializedEvent(
  depositKey: BigInt,
  caller: Address,
  depositOwner: Address,
  initialAmount: BigInt,
  btcFundingTxHash: string,
): DepositInitialized {
  const depositInitializedEvent = changetype<DepositInitialized>(newMockEvent())

  depositInitializedEvent.parameters = []

  const depositKeyParam = new ethereum.EventParam(
    "depositKey",
    ethereum.Value.fromUnsignedBigInt(depositKey),
  )
  const callerParam = new ethereum.EventParam(
    "caller",
    ethereum.Value.fromAddress(caller),
  )

  const depositOwnerParam = new ethereum.EventParam(
    "depositOwner",
    ethereum.Value.fromAddress(depositOwner),
  )

  const initialAmountParam = new ethereum.EventParam(
    "initialAmount",
    ethereum.Value.fromUnsignedBigInt(initialAmount),
  )

  // Logs data from https://sepolia.etherscan.io/tx/0x6805986942c86496853cb1d0146120a6b55e57fb4feec605c49edef2b34903bb#eventlog
  const log = new ethereum.Log(
    Address.fromString("0x9b1a7fE5a16A15F2f9475C5B231750598b113403"),
    [
      // Event signature
      Bytes.fromHexString(
        "0xa7382159a693ed317a024daf0fd1ba30805cdf9928ee09550af517c516e2ef05",
      ),
      // `depositor` - indexed topic 1
      Bytes.fromHexString(
        "0x0000000000000000000000002f86fe8c5683372db667e6f6d88dcb6d55a81286",
      ),
      // `walletPubKeyHash` - indexed topic 2
      Bytes.fromHexString(
        "0x79073502d1fcf0cc9b9a1b7c56cadda76d33fe98000000000000000000000000",
      ),
    ],
    Bytes.fromHexString(
      `0x${btcFundingTxHash}000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000186a00f56f5715acb9a25000000000000000000000000000000000000000000000000f2096fc9cbf2aca10025af13cbf9a685d963fde8000000000000000000000000e1c1946700000000000000000000000000000000000000000000000000000000000000000000000000000000b5679de944a79732a75ce556191df11f489448d5`,
    ),
    depositInitializedEvent.block.hash,
    Bytes.fromI32(1),
    depositInitializedEvent.transaction.hash,
    depositInitializedEvent.transaction.index,
    depositInitializedEvent.logIndex,
    depositInitializedEvent.transactionLogIndex,
    depositInitializedEvent.logType as string,
    new Wrapped(false),
  )

  ;(depositInitializedEvent.receipt as ethereum.TransactionReceipt).logs.push(
    log,
  )

  depositInitializedEvent.parameters.push(depositKeyParam)
  depositInitializedEvent.parameters.push(callerParam)
  depositInitializedEvent.parameters.push(depositOwnerParam)
  depositInitializedEvent.parameters.push(initialAmountParam)

  return depositInitializedEvent
}

export function createDepositFinalizedEvent(
  depositKey: BigInt,
  caller: Address,
  referral: i16,
  initialAmount: BigInt,
  bridgedAmount: BigInt,
  depositorFee: BigInt,
): DepositFinalized {
  const depositFinalizedEvent = changetype<DepositFinalized>(newMockEvent())

  depositFinalizedEvent.parameters = []

  const depositKeyParam = new ethereum.EventParam(
    "depositKey",
    ethereum.Value.fromUnsignedBigInt(depositKey),
  )
  const callerParam = new ethereum.EventParam(
    "caller",
    ethereum.Value.fromAddress(caller),
  )

  const referralParam = new ethereum.EventParam(
    "referral",
    ethereum.Value.fromI32(referral),
  )

  const initialAmountParam = new ethereum.EventParam(
    "initialAmount",
    ethereum.Value.fromUnsignedBigInt(initialAmount),
  )

  const bridgedAmountParam = new ethereum.EventParam(
    "bridgedAmount",
    ethereum.Value.fromUnsignedBigInt(bridgedAmount),
  )

  const depositorFeeParam = new ethereum.EventParam(
    "depositorFee",
    ethereum.Value.fromUnsignedBigInt(depositorFee),
  )

  depositFinalizedEvent.parameters.push(depositKeyParam)
  depositFinalizedEvent.parameters.push(callerParam)
  depositFinalizedEvent.parameters.push(referralParam)
  depositFinalizedEvent.parameters.push(initialAmountParam)
  depositFinalizedEvent.parameters.push(bridgedAmountParam)
  depositFinalizedEvent.parameters.push(depositorFeeParam)

  return depositFinalizedEvent
}

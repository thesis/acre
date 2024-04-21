import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  createDepositInitializedEvent,
  createDepositFinalizedEvent,
} from "./bitcoin-depositor-utils"
import {
  handleDepositFinalized,
  handleDepositInitialized,
} from "../src/bitcoin-depositor"

const depositKey = BigInt.fromI32(234)
const caller = Address.fromString("0x0000000000000000000000000000000000000001")
const depositOwner = Address.fromString(
  "0x0000000000000000000000000000000000000001",
)
const referral = BigInt.fromI32(234)
const initialAmount = BigInt.fromI32(234)
const bridgedAmount = BigInt.fromI32(234)
const depositorFee = BigInt.fromI32(234)

const depositInitializedEvent = createDepositInitializedEvent(
  depositKey,
  caller,
  depositOwner,
  initialAmount,
)

const depositFinalizedEvent = createDepositFinalizedEvent(
  depositKey,
  caller,
  depositOwner,
  referral,
  initialAmount,
  bridgedAmount,
  depositorFee,
)

describe("createDepositInitializedEvent event", () => {
  beforeEach(() => {
    handleDepositInitialized(depositInitializedEvent)
  })

  afterEach(() => {
    clearStore()
  })

  test("should create DepositOwner entity", () => {
    assert.entityCount("DepositOwner", 1)
  })

  test("should create Deposit entity", () => {
    assert.entityCount("Deposit", 1)
  })

  test("should create LogData entities", () => {
    assert.entityCount("LogData", 2)
  })

  test("Deposit entity has proper fields", () => {
    assert.fieldEquals(
      "Deposit",
      depositInitializedEvent.params.depositKey.toHexString(),
      "depositOwner",
      depositOwner.toHexString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositInitializedEvent.params.depositKey.toHexString(),
      "depositOwner",
      depositOwner.toHexString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositInitializedEvent.params.depositKey.toHexString(),
      "initialDepositAmountSatoshi",
      depositInitializedEvent.params.initialAmount.toString(),
    )
  })

  test("LogData entity has proper fields", () => {
    const txBtcId = `${depositInitializedEvent.transaction.hash.toHexString()}btc`
    const txEthId = `${depositInitializedEvent.transaction.hash.toHexString()}eth`

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "activity",
      depositInitializedEvent.params.depositKey.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "activity",
      depositInitializedEvent.params.depositKey.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "timestamp",
      depositInitializedEvent.block.timestamp.toString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "timestamp",
      depositInitializedEvent.block.timestamp.toString(),
    )

    assert.fieldEquals("LogData", txBtcId, "chain", "Bitcoin")
    assert.fieldEquals("LogData", txEthId, "chain", "Ethereum")

    assert.fieldEquals("LogData", txBtcId, "amount", initialAmount.toString())
    assert.fieldEquals("LogData", txEthId, "amount", initialAmount.toString())
  })
})

describe("createDepositFinalizedEvent event", () => {
  beforeEach(() => {
    handleDepositFinalized(depositFinalizedEvent)
  })

  afterEach(() => {
    clearStore()
  })

  test("should create DepositOwner entity", () => {
    assert.entityCount("DepositOwner", 1)
  })

  test("should create Deposit entity", () => {
    assert.entityCount("Deposit", 1)
  })

  test("should create LogData entities", () => {
    assert.entityCount("LogData", 2)
  })

  test("Deposit entity has proper fields", () => {
    assert.fieldEquals(
      "Deposit",
      depositFinalizedEvent.params.depositKey.toHexString(),
      "depositOwner",
      depositOwner.toHexString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositFinalizedEvent.params.depositKey.toHexString(),
      "initialDepositAmountSatoshi",
      depositFinalizedEvent.params.initialAmount.toString(),
    )
  })

  test("LogData entity has proper fields", () => {
    const txBtcId = `${depositFinalizedEvent.transaction.hash.toHexString()}btc`
    const txEthId = `${depositFinalizedEvent.transaction.hash.toHexString()}eth`

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "activity",
      depositFinalizedEvent.params.depositKey.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "activity",
      depositFinalizedEvent.params.depositKey.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "timestamp",
      depositFinalizedEvent.block.timestamp.toString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "timestamp",
      depositFinalizedEvent.block.timestamp.toString(),
    )

    assert.fieldEquals("LogData", txBtcId, "chain", "Bitcoin")
    assert.fieldEquals("LogData", txEthId, "chain", "Ethereum")

    assert.fieldEquals("LogData", txBtcId, "amount", initialAmount.toString())
    assert.fieldEquals("LogData", txEthId, "amount", initialAmount.toString())
  })
})

import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { createDepositInitializedEvent } from "./acre-bitcoin-depositor-utils"
import { handleDepositInitialized } from "../src/acre-bitcoin-depositor"

const depositKey = BigInt.fromI32(234)
const caller = Address.fromString("0x0000000000000000000000000000000000000001")
const depositOwner = Address.fromString(
  "0x0000000000000000000000000000000000000001",
)
const initialAmount = BigInt.fromI32(234)

const event = createDepositInitializedEvent(
  depositKey,
  caller,
  depositOwner,
  initialAmount,
)

describe("createStakeRequestInitialized event", () => {
  beforeEach(() => {
    handleDepositInitialized(event)
  })

  afterEach(() => {
    clearStore()
  })

  test("should create DepositOwner entity", () => {
    assert.entityCount("DepositOwner", 1)
  })

  test("should create Stake entity", () => {
    assert.entityCount("Stake", 1)
  })

  test("should create LogData entities", () => {
    assert.entityCount("LogData", 2)
  })

  test("Stake entity has proper fields", () => {
    assert.fieldEquals(
      "Stake",
      event.transaction.hash.toHexString(),
      "depositOwner",
      depositOwner.toHexString(),
    )

    assert.fieldEquals(
      "Stake",
      event.transaction.hash.toHexString(),
      "initialDepositAmountSatoshi",
      event.params.initialAmount.toString(),
    )
  })

  test("LogData entity has proper fields", () => {
    const txBtcId = `${event.transaction.hash.toHexString()}btc`
    const txEthId = `${event.transaction.hash.toHexString()}eth`

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "activity",
      event.transaction.hash.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "activity",
      event.transaction.hash.toHexString(),
    )

    assert.fieldEquals(
      "LogData",
      txBtcId,
      "timestamp",
      event.block.timestamp.toString(),
    )

    assert.fieldEquals(
      "LogData",
      txEthId,
      "timestamp",
      event.block.timestamp.toString(),
    )

    assert.fieldEquals("LogData", txBtcId, "chain", "Bitcoin")
    assert.fieldEquals("LogData", txEthId, "chain", "Ethereum")

    assert.fieldEquals("LogData", txBtcId, "amount", initialAmount.toString())
    assert.fieldEquals("LogData", txEthId, "amount", initialAmount.toString())
  })
})

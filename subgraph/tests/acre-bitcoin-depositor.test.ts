import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
  beforeEach,
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { createStakeRequestInitializedEvent } from "./acre-bitcoin-depositor-utils"
import { handleStakeRequestInitialized } from "../src/acre-bitcoin-depositor"

const depositKey = BigInt.fromI32(234)
const caller = Address.fromString("0x0000000000000000000000000000000000000001")
const staker = Address.fromString("0x0000000000000000000000000000000000000001")
const initialAmount = BigInt.fromI32(234)

const event = createStakeRequestInitializedEvent(
  depositKey,
  caller,
  staker,
  initialAmount,
)

describe("createStakeRequestInitialized event", () => {
  beforeEach(() => {
    handleStakeRequestInitialized(event)
  })

  afterEach(() => {
    clearStore()
  })

  test("should create Staker entity", () => {
    assert.entityCount("Staker", 1)
  })

  test("should create LogData entities", () => {
    assert.entityCount("LogData", 2)
  })

  test("LogData entity has proper fields", () => {
    const txBtcId = `${event.transaction.hash.toHexString()}btc`
    const txEthId = `${event.transaction.hash.toHexString()}eth`

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

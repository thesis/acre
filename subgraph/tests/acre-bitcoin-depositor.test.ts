// acre-bitcoin-depositor.test.ts

import {
  assert,
  describe,
  test,
  clearStore,
  afterEach,
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { createStakeRequestInitializedEvent } from "./acre-bitcoin-depositor-utils"
import { handleStakeRequestInitialized } from "../src/acre-bitcoin-depositor"

describe("createStakeRequestInitialized event", () => {
  afterEach(() => {
    clearStore()
  })

  test("StakeRequestInitialized entity does not exist in the store", () => {
    assert.notInStore("StakeRequestInitialized", "")
  })

  test("Staker entity does not exist in the store", () => {
    assert.notInStore("Stake", "")
  })

  test("LogData entity does not exist in the store", () => {
    assert.notInStore("LogData", "")
  })

  test("should create StakeRequestInitialized entity", () => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const staker = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const initialAmount = BigInt.fromI32(234)

    const event = createStakeRequestInitializedEvent(
      depositKey,
      caller,
      staker,
      initialAmount,
    )
    handleStakeRequestInitialized(event)

    assert.entityCount("StakeRequestInitialized", 1)
  })

  test("StakeRequestInitialized entity has proper fields", () => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const staker = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const initialAmount = BigInt.fromI32(10000)

    const event = createStakeRequestInitializedEvent(
      depositKey,
      caller,
      staker,
      initialAmount,
    )

    handleStakeRequestInitialized(event)

    const txId = event.transaction.hash.toHexString()

    assert.fieldEquals(
      "StakeRequestInitialized",
      txId,
      "depositKey",
      depositKey.toString(),
    )

    assert.fieldEquals(
      "StakeRequestInitialized",
      txId,
      "staker",
      staker.toHexString(),
    )

    assert.fieldEquals(
      "StakeRequestInitialized",
      txId,
      "caller",
      caller.toHexString(),
    )
  })

  test("should create Staker entity", () => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const staker = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const initialAmount = BigInt.fromI32(234)

    const event = createStakeRequestInitializedEvent(
      depositKey,
      caller,
      staker,
      initialAmount,
    )
    handleStakeRequestInitialized(event)

    assert.entityCount("Staker", 1)
  })

  test("should create LogData entities", () => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const staker = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const initialAmount = BigInt.fromI32(234)

    const event = createStakeRequestInitializedEvent(
      depositKey,
      caller,
      staker,
      initialAmount,
    )
    handleStakeRequestInitialized(event)

    assert.entityCount("LogData", 2)
  })

  test("LogData entity has proper fields", () => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const staker = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const initialAmount = BigInt.fromI32(10000)

    const event = createStakeRequestInitializedEvent(
      depositKey,
      caller,
      staker,
      initialAmount,
    )

    handleStakeRequestInitialized(event)

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

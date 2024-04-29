import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
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
const nextDepositKey = BigInt.fromI32(345)
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

const nextDepositInitializedEvent = createDepositInitializedEvent(
  nextDepositKey,
  caller,
  depositOwner,
  initialAmount,
)

const depositFinalizedEvent = createDepositFinalizedEvent(
  depositKey,
  caller,
  referral,
  initialAmount,
  bridgedAmount,
  depositorFee,
)

describe("handleDepositInitialized", () => {
  describe("when the deposit owner doesn't exist yet", () => {
    beforeAll(() => {
      handleDepositInitialized(depositInitializedEvent)
    })

    afterAll(() => {
      clearStore()
    })

    test("should create DepositOwner entity", () => {
      assert.entityCount("DepositOwner", 1)
    })

    test("should create Deposit entity", () => {
      assert.entityCount("Deposit", 1)
    })

    test("should create Event entity", () => {
      assert.entityCount("Event", 1)
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
        "initialDepositAmount",
        depositInitializedEvent.params.initialAmount.toString(),
      )
    })

    test("Event entity has proper fields", () => {
      const txId = `${depositInitializedEvent.transaction.hash.toHexString()}_DepositInitialized`

      assert.fieldEquals(
        "Event",
        txId,
        "activity",
        depositInitializedEvent.params.depositKey.toHexString(),
      )

      assert.fieldEquals(
        "Event",
        txId,
        "timestamp",
        depositInitializedEvent.block.timestamp.toString(),
      )

      assert.fieldEquals("Event", txId, "type", "Initialized")
    })
  })

  describe("when the deposit owner already exists", () => {
    beforeAll(() => {
      handleDepositInitialized(depositInitializedEvent)
      handleDepositInitialized(nextDepositInitializedEvent)
    })

    afterAll(() => {
      clearStore()
    })

    test("should create DepositOwner entity", () => {
      assert.entityCount("DepositOwner", 1)
    })

    test("should create Deposit entity", () => {
      assert.entityCount("Deposit", 2)
    })

    test("should create Event entity", () => {
      assert.entityCount("Event", 1)
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
        "initialDepositAmount",
        depositInitializedEvent.params.initialAmount.toString(),
      )

      assert.fieldEquals(
        "Deposit",
        nextDepositInitializedEvent.params.depositKey.toHexString(),
        "depositOwner",
        depositOwner.toHexString(),
      )

      assert.fieldEquals(
        "Deposit",
        nextDepositInitializedEvent.params.depositKey.toHexString(),
        "initialDepositAmount",
        nextDepositInitializedEvent.params.initialAmount.toString(),
      )
    })

    test("Event entity has proper fields", () => {
      const nextTxId = `${nextDepositInitializedEvent.transaction.hash.toHexString()}_DepositInitialized`

      assert.fieldEquals(
        "Event",
        nextTxId,
        "activity",
        nextDepositInitializedEvent.params.depositKey.toHexString(),
      )

      assert.fieldEquals(
        "Event",
        nextTxId,
        "timestamp",
        nextDepositInitializedEvent.block.timestamp.toString(),
      )

      assert.fieldEquals("Event", nextTxId, "type", "Initialized")
    })
  })
})

describe("handleDepositFinalized", () => {
  beforeEach(() => {
    handleDepositInitialized(depositInitializedEvent)
    handleDepositFinalized(depositFinalizedEvent)
  })

  afterEach(() => {
    clearStore()
  })

  test("Deposit entity should exist", () => {
    assert.entityCount("Deposit", 1)
  })

  test("Event entity should exist", () => {
    assert.entityCount("Event", 2)
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
      "initialDepositAmount",
      depositFinalizedEvent.params.initialAmount.toString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositFinalizedEvent.params.depositKey.toHexString(),
      "bridgedAmount",
      depositFinalizedEvent.params.bridgedAmount.toString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositFinalizedEvent.params.depositKey.toHexString(),
      "depositorFee",
      depositFinalizedEvent.params.depositorFee.toString(),
    )

    assert.fieldEquals(
      "Deposit",
      depositFinalizedEvent.params.depositKey.toHexString(),
      "amountToDeposit",
      depositFinalizedEvent.params.bridgedAmount
        .minus(depositFinalizedEvent.params.depositorFee)
        .toString(),
    )
  })

  test("Event entity has proper fields", () => {
    const txId = `${depositInitializedEvent.transaction.hash.toHexString()}_DepositFinalized`

    assert.fieldEquals(
      "Event",
      txId,
      "activity",
      depositFinalizedEvent.params.depositKey.toHexString(),
    )

    assert.fieldEquals(
      "Event",
      txId,
      "timestamp",
      depositFinalizedEvent.block.timestamp.toString(),
    )

    assert.fieldEquals("Event", txId, "type", "Finalized")
  })

  test("doesn't create entities when depositEntity not exist", () => {
    clearStore()
    handleDepositFinalized(depositFinalizedEvent)
    assert.entityCount("Deposit", 0)
    assert.entityCount("DepositOwner", 0)
    assert.entityCount("Event", 0)
  })
})

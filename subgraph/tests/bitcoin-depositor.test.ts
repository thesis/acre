import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
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
  referral,
  initialAmount,
  bridgedAmount,
  depositorFee,
)

describe("handleDepositInitialized", () => {
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

describe("handleDepositFinalized", () => {
  beforeAll(() => {
    handleDepositInitialized(depositInitializedEvent)
    handleDepositFinalized(depositFinalizedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("Deposit entity should exist", () => {
    assert.entityCount("Deposit", 1)
  })

  test("Event entity should exist", () => {
    assert.entityCount("Event", 1)
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
})

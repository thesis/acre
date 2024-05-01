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
import { DepositOwner } from "../generated/schema"

// Shared
const caller = Address.fromString("0x0000000000000000000000000000000000000001")
const depositOwner = Address.fromString(
  "0x0000000000000000000000000000000000000001",
)
const referral: i16 = 234
const initialAmount = BigInt.fromI32(234)
const bridgedAmount = BigInt.fromI32(234)
const depositorFee = BigInt.fromI32(234)

// First deposit
const depositKey = BigInt.fromI32(234)
const fundingTxHash =
  "03063F39C8F0F9D3D742A73D1D5AF22548BFFF2E4D292BEAFF2BE1FE75CE1556"
const expectedBitcoinTxId =
  "5615CE75FEE12BFFEA2B294D2EFFBF4825F25A1D3DA742D7D3F9F0C8393F0603".toLowerCase()
const depositInitializedEvent = createDepositInitializedEvent(
  depositKey,
  caller,
  depositOwner,
  initialAmount,
  fundingTxHash,
)

// Second deposit
const secondDepositKey = BigInt.fromI32(555)
const secondFundingTxHash =
  "1F0BCD97CD8556AFBBF0EE1D319A8F873B11EA60C536F57AAF25812B19A7F76C"
const secondExpectedBitcoinTxId =
  "6CF7A7192B8125AF7AF536C560EA113B878F9A311DEEF0BBAF5685CD97CD0B1F".toLowerCase()
const secondDepositInitializedEvent = createDepositInitializedEvent(
  secondDepositKey,
  caller,
  depositOwner,
  initialAmount,
  secondFundingTxHash,
)

// First deposit finalized
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
      const depositEntityId =
        depositInitializedEvent.params.depositKey.toHexString()

      assert.fieldEquals(
        "Deposit",
        depositEntityId,
        "depositOwner",
        depositOwner.toHexString(),
      )

      assert.fieldEquals(
        "Deposit",
        depositEntityId,
        "initialDepositAmount",
        depositInitializedEvent.params.initialAmount.toString(),
      )

      assert.fieldEquals(
        "Deposit",
        depositEntityId,
        "bitcoinTransactionId",
        expectedBitcoinTxId,
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
      handleDepositInitialized(secondDepositInitializedEvent)
    })

    afterAll(() => {
      clearStore()
    })

    test("the DepositOwner entity should already exists", () => {
      const existingDepositOwner = DepositOwner.load(
        secondDepositInitializedEvent.params.depositOwner.toHexString(),
      )

      assert.assertNotNull(existingDepositOwner)
      assert.entityCount("DepositOwner", 1)
    })

    test("should create the second deposit correctly", () => {
      const secondDepositEntityId =
        secondDepositInitializedEvent.params.depositKey.toHexString()

      assert.fieldEquals(
        "Deposit",
        secondDepositEntityId,
        "depositOwner",
        depositOwner.toHexString(),
      )

      assert.fieldEquals(
        "Deposit",
        secondDepositEntityId,
        "initialDepositAmount",
        depositInitializedEvent.params.initialAmount.toString(),
      )

      assert.fieldEquals(
        "Deposit",
        secondDepositEntityId,
        "bitcoinTransactionId",
        secondExpectedBitcoinTxId,
      )
    })

    test("Event entity has proper fields", () => {
      const nextTxId = `${secondDepositInitializedEvent.transaction.hash.toHexString()}_DepositInitialized`

      assert.fieldEquals(
        "Event",
        nextTxId,
        "activity",
        secondDepositInitializedEvent.params.depositKey.toHexString(),
      )

      assert.fieldEquals(
        "Event",
        nextTxId,
        "timestamp",
        secondDepositInitializedEvent.block.timestamp.toString(),
      )

      assert.fieldEquals("Event", nextTxId, "type", "Initialized")
    })
  })
})

describe("handleDepositFinalized", () => {
  describe("when deposit entity already exist", () => {
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
  })

  describe("when the Deposit entity does not exist", () => {
    test(
      "should throw an error",
      () => {
        handleDepositFinalized(depositFinalizedEvent)
      },
      true,
    )
  })
})

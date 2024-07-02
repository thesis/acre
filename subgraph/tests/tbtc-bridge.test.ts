import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  dataSourceMock,
} from "matchstick-as/assembly/index"

import { DataSourceContext, Bytes } from "@graphprotocol/graph-ts"
import { createRedemptionRequestedEvent } from "./tbtc-bridge-utils"
import { handleRedemptionRequested } from "../src/tbtc-bridge"

// Set up context
const context = new DataSourceContext()
context.setBytes(
  "bitcoinRedeemerAddress",
  Bytes.fromHexString("0xa7049b83dB603f4a7FE93B29D2DfEa76065e76E8"),
)

dataSourceMock.setReturnValues(
  "0x2F86FE8C5683372Db667E6f6d88dcB6d55a81286",
  "sepolia",
  context,
)

const redemptionRequestedEventData = createRedemptionRequestedEvent()
const owner = redemptionRequestedEventData.acreOwner
const amount = redemptionRequestedEventData.tbtcAmount

describe("handleRedemptionRequested", () => {
  describe("when there is only one withdraw with the same redemption key", () => {
    beforeAll(() => {
      handleRedemptionRequested(redemptionRequestedEventData.event)
    })

    afterAll(() => {
      clearStore()
    })

    test("should create DepositOwner entity", () => {
      assert.entityCount(
        "DepositOwner",
        1,
        "Invalid `DepositOwner` entity count",
      )
    })

    test("should create RedemptionKeyCounter entity", () => {
      assert.fieldEquals(
        "RedemptionKeyCounter",
        redemptionRequestedEventData.redemptionKey,
        "counter",
        "1",
      )
    })

    test("should create Withdraw entity", () => {
      assert.entityCount("Withdraw", 1, "Invalid `Withdraw` entity count")
    })

    test("should create Event entity", () => {
      assert.entityCount("Event", 1, "Invalid `Event` entity count")
    })

    test("should save Withdraw entity with correct fields", () => {
      const withdrawEntityId =
        redemptionRequestedEventData.redemptionKey.concat("-1")

      assert.fieldEquals(
        "Withdraw",
        withdrawEntityId,
        "depositOwner",
        owner.toHexString(),
        `Withdraw entity with id (${withdrawEntityId}) does not exist or has incorrect depositOwner value`,
      )

      assert.fieldEquals(
        "Withdraw",
        withdrawEntityId,
        "amount",
        amount.toString(),
        `Withdraw entity with id (${withdrawEntityId}) does not exist or has incorrect amount value`,
      )
    })
  })

  describe("when there is already withdraw with the same redemption key", () => {
    beforeAll(() => {
      handleRedemptionRequested(redemptionRequestedEventData.event)
      handleRedemptionRequested(redemptionRequestedEventData.event)
    })

    afterAll(() => {
      clearStore()
    })

    test("should save 2 withdrawals", () => {
      assert.entityCount("Withdraw", 2, "Invalid `Withdraw` entity count")
    })

    test("should count the redemption key correctly", () => {
      assert.fieldEquals(
        "RedemptionKeyCounter",
        redemptionRequestedEventData.redemptionKey,
        "counter",
        "2",
      )
    })

    test("should set correct id", () => {
      const withdrawEntityId =
        redemptionRequestedEventData.redemptionKey.concat("-1")
      const withdrawEntityId2 =
        redemptionRequestedEventData.redemptionKey.concat("-2")

      assert.fieldEquals(
        "Withdraw",
        withdrawEntityId,
        "id",
        withdrawEntityId,
        `Id should be ${withdrawEntityId}`,
      )

      assert.fieldEquals(
        "Withdraw",
        withdrawEntityId2,
        "id",
        withdrawEntityId2,
        `Id should be ${withdrawEntityId2}`,
      )
    })
  })
})

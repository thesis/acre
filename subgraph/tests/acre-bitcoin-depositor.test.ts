import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { handleBridgingCompleted } from "../src/acre-bitcoin-depositor"
import { createBridgingCompletedEvent } from "./acre-bitcoin-depositor-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    const depositKey = BigInt.fromI32(234)
    const caller = Address.fromString(
      "0x0000000000000000000000000000000000000001",
    )
    const referral = 123
    const bridgedAmount = BigInt.fromI32(234)
    const depositorFee = BigInt.fromI32(234)
    const newBridgingCompletedEvent = createBridgingCompletedEvent(
      depositKey,
      caller,
      referral,
      bridgedAmount,
      depositorFee,
    )
    handleBridgingCompleted(newBridgingCompletedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BridgingCompleted created and stored", () => {
    assert.entityCount("BridgingCompleted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BridgingCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "depositKey",
      "234",
    )
    assert.fieldEquals(
      "BridgingCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "caller",
      "0x0000000000000000000000000000000000000001",
    )
    assert.fieldEquals(
      "BridgingCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "referral",
      "123",
    )
    assert.fieldEquals(
      "BridgingCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "bridgedAmount",
      "234",
    )
    assert.fieldEquals(
      "BridgingCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000",
      "depositorFee",
      "234",
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})

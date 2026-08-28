import { describe, expect, it } from "vitest"
import { activitiesUtils } from "#/utils"

describe("Utils functions for activities", () => {
  describe("getEstimatedDuration", () => {
    describe("withdraw", () => {
      // Redeemed straight from the acreBTC contract, so it settles in the
      // transaction that requests it - no bridge and no queue to wait on.
      describe("when the destination is tBTC on Ethereum", () => {
        it("should return the Ethereum transaction time", () => {
          expect(
            activitiesUtils.getEstimatedDuration(
              BigInt(1e8),
              "withdraw",
              false,
              "tbtc",
            ),
          ).toEqual("5 minutes")
        })

        it("should shorten the time unit suffix when asked", () => {
          expect(
            activitiesUtils.getEstimatedDuration(
              BigInt(1e8),
              "withdraw",
              true,
              "tbtc",
            ),
          ).toEqual("5m")
        })
      })

      // Bridged to Bitcoin, and the tBTC redemption process does not depend
      // on the amount.
      describe.each([
        // 0.01 BTC
        { value: 0.01, expectedResult: "6 hours" },
        // 0.1 BTC
        { value: 0.1, expectedResult: "6 hours" },
        // 1 BTC
        { value: 1, expectedResult: "6 hours" },
        // 10 BTC
        { value: 10, expectedResult: "6 hours" },
      ])("when it is $value BTC", ({ value, expectedResult }) => {
        it(`should return ${expectedResult}`, () => {
          expect(
            activitiesUtils.getEstimatedDuration(
              BigInt(value * 1e8),
              "withdraw",
            ),
          ).toEqual(expectedResult)
        })
      })
    })

    describe("deposit", () => {
      describe.each([
        // 0.0001 BTC
        { value: 0.0001, expectedResult: "2 hours" },
        // 0.001 BTC
        { value: 0.001, expectedResult: "2 hours" },
        // 0.01 BTC
        { value: 0.01, expectedResult: "2 hours" },
        // 0.09 BTC
        { value: 0.09, expectedResult: "2 hours" },
        // 0.1 BTC
        { value: 0.1, expectedResult: "2 hours" },
        // 0.9 BTC
        { value: 0.9, expectedResult: "2 hours" },
        // 1 BTC
        { value: 1, expectedResult: "3 hours" },
        // 10 BTC
        { value: 10, expectedResult: "3 hours" },
      ])("when it is $value BTC", ({ value, expectedResult }) => {
        it(`should return ${expectedResult}`, () => {
          expect(
            activitiesUtils.getEstimatedDuration(
              BigInt(value * 1e8),
              "deposit",
            ),
          ).toEqual(expectedResult)
        })
      })
    })
  })
})

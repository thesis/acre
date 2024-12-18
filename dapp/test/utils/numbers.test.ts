import { describe, expect, it } from "vitest"
import { roundUp } from "#/utils/numbers"

describe("Utils functions for numbers", () => {
  describe("roundUp", () => {
    describe.each([
      { value: 2.111, desiredDecimals: 2, expectedValue: 2.12 },
      { value: 2.1201, desiredDecimals: 2, expectedValue: 2.13 },
      { value: 2.11, desiredDecimals: 1, expectedValue: 2.2 },
      { value: 2.1, desiredDecimals: 0, expectedValue: 3 },
    ])("when it is $value", ({ value, desiredDecimals, expectedValue }) => {
      it(`should be rounded up to ${expectedValue}`, () => {
        const result = roundUp(value, desiredDecimals)
        expect(result).toEqual(expectedValue)
      })
    })

    describe.each([
      { value: 2.99, desiredDecimals: 2 },
      { value: 3.1, desiredDecimals: 1 },
      { value: 2, desiredDecimals: 0 },
    ])("when it is $value", ({ value, desiredDecimals }) => {
      it("should not be rounded up", () => {
        const result = roundUp(value, desiredDecimals)
        expect(result).toEqual(value)
      })
    })
  })
})

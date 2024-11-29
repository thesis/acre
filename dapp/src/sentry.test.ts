import { describe, expect, it, vi } from "vitest"
import * as Sentry from "@sentry/react"
import sentry from "./sentry"

describe("sentry", () => {
  describe("setUser", () => {
    vi.mock("@sentry/react")

    const testCases = [
      { bitcoinAddress: undefined, expectedResult: null },
      { bitcoinAddress: "", expectedResult: null },
      { bitcoinAddress: " ", expectedResult: null },
      {
        bitcoinAddress: "17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem",
        expectedResult: { id: "1f520a9757" },
      },
      {
        bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
        expectedResult: { id: "6cd42dab02" },
      },
      {
        bitcoinAddress: "BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4",
        expectedResult: { id: "6cd42dab02" },
      },
    ]

    describe.each(testCases)(
      "when address is $bitcoinAddress",
      ({ bitcoinAddress, expectedResult }) => {
        it("should set expected user in Sentry", () => {
          sentry.setUser(bitcoinAddress)

          expect(Sentry.setUser).toHaveBeenCalledWith(expectedResult)
        })
      },
    )
  })
})

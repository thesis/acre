/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { ZeroAddress } from "ethers"

import { isNonZeroAddress } from "../helpers/address"

const ADDRESS_1: string = "0xb894c3967CFb58A5c55f1de4131d126B1eFA1EE0"
const ADDRESS_1_LOWERCASE: string = ADDRESS_1.toLowerCase()
const ADDRESS_1_NO_PREFIX: string = ADDRESS_1.substring(2)
const ADDRESS_INVALID: string = "0xXYZ4c3967CFb58A5c55f1de4131d126B1eFA1EE0"
const ADDRESS_ZERO: string = ZeroAddress

describe("Helpers", () => {
  describe("address", () => {
    describe("isNonZeroAddress", () => {
      it("should return true for valid checksumed address", () => {
        expect(isNonZeroAddress(ADDRESS_1)).to.be.true
      })

      it("should return true for lowercase address", () => {
        expect(isNonZeroAddress(ADDRESS_1_LOWERCASE)).to.be.true
      })

      it("should return true for address without 0x prefix", () => {
        expect(isNonZeroAddress(ADDRESS_1_NO_PREFIX)).to.be.true
      })

      it("should return false for zero address", () => {
        expect(isNonZeroAddress(ADDRESS_ZERO)).to.be.false
      })

      it("should throw an error for empty string", () => {
        expect(() => {
          isNonZeroAddress("")
        }).to.throw("invalid address")
      })

      it("should throw an error for address containing invalid character", () => {
        expect(() => {
          isNonZeroAddress(ADDRESS_INVALID)
        }).to.throw("invalid address")
      })
    })
  })
})

import {
  BitcoinAddressConverter,
  BitcoinScriptUtils,
} from "@keep-network/tbtc-v2.ts"
import {
  isPayToScriptHashTypeAddress,
  isPublicKeyHashTypeAddress,
} from "../../../src"
import { btcAddresses } from "./data"

// tBTC v2 deposit process supports:
// - Deposit supports: P2PKH or P2WPKH (as recovery address)
// - Redemption supports: P2PKH, P2WPKH, P2SH, and P2WSH (as redeemer address)
const isSupportedByTBTC = (type: string): boolean =>
  type === "P2PKH" || type === "P2WPKH" || type === "P2SH" || type === "P2WSH"

describe("isPublicKeyHashTypeAddress", () => {
  const btcAddressesWithExpectedResult = btcAddresses.map((address) => ({
    ...address,
    expectedResult: address.type === "P2PKH" || address.type === "P2WPKH",
  }))

  describe("when an address is supported by tBTC network", () => {
    const supportedAddresses = btcAddressesWithExpectedResult.filter(
      ({ type }) => isSupportedByTBTC(type),
    )

    describe.each(supportedAddresses)(
      "when it is $type $network address",
      ({ expectedResult, network, address, scriptPubKey }) => {
        const spyOnAddressToOutputScript = jest.spyOn(
          BitcoinAddressConverter,
          "addressToOutputScript",
        )
        let result: boolean

        beforeAll(() => {
          result = isPublicKeyHashTypeAddress(address, network)
        })

        it("should convert address to output script", () => {
          expect(spyOnAddressToOutputScript).toHaveBeenCalledWith(
            address,
            network,
          )

          expect(spyOnAddressToOutputScript).toHaveReturnedWith(scriptPubKey)
        })

        it(`should return ${expectedResult}`, () => {
          expect(result).toBe(expectedResult)
        })
      },
    )
  })

  describe("when an address is not supported by tBTC network", () => {
    const notSupportedAddresses = btcAddressesWithExpectedResult.filter(
      ({ type }) => !isSupportedByTBTC(type),
    )

    describe.each(notSupportedAddresses)(
      "when it is $type $network address",
      ({ network, address }) => {
        const spyOnAddressToOutputScript = jest.spyOn(
          BitcoinAddressConverter,
          "addressToOutputScript",
        )
        let spyOnIsP2PKHScript: jest.SpyInstance<boolean>
        let spyOnIsP2WPKHScript: jest.SpyInstance<boolean>
        let result: boolean

        beforeAll(() => {
          spyOnIsP2PKHScript = jest.spyOn(BitcoinScriptUtils, "isP2PKHScript")
          spyOnIsP2WPKHScript = jest.spyOn(BitcoinScriptUtils, "isP2WPKHScript")

          result = isPublicKeyHashTypeAddress(address, network)
        })

        it("should not be able to convert address to output script", () => {
          expect(spyOnAddressToOutputScript).toThrow()
        })

        it("should not check if an address is P2PKH or P2WPKH", () => {
          expect(spyOnIsP2PKHScript).not.toHaveBeenCalled()
          expect(spyOnIsP2WPKHScript).not.toHaveBeenCalled()
        })

        it("should return false", () => {
          expect(result).toBeFalsy()
        })
      },
    )
  })
})

describe("isPayToScriptHashTypeAddress", () => {
  const btcAddressesWithExpectedResult = btcAddresses.map((address) => ({
    ...address,
    expectedResult: address.type === "P2SH" || address.type === "P2WSH",
  }))

  describe("when an address is supported by tBTC network", () => {
    const supportedAddresses = btcAddressesWithExpectedResult.filter(
      ({ type }) => isSupportedByTBTC(type),
    )

    describe.each(supportedAddresses)(
      "when it is $type $network address",
      ({ expectedResult, network, address, scriptPubKey }) => {
        const spyOnAddressToOutputScript = jest.spyOn(
          BitcoinAddressConverter,
          "addressToOutputScript",
        )
        let result: boolean

        beforeAll(() => {
          result = isPayToScriptHashTypeAddress(address, network)
        })

        it("should convert address to output script", () => {
          expect(spyOnAddressToOutputScript).toHaveBeenCalledWith(
            address,
            network,
          )

          expect(spyOnAddressToOutputScript).toHaveReturnedWith(scriptPubKey)
        })

        it(`should return ${expectedResult}`, () => {
          expect(result).toBe(expectedResult)
        })
      },
    )
  })

  describe("when an address is not supported by tBTC network", () => {
    const notSupportedAddresses = btcAddressesWithExpectedResult.filter(
      ({ type }) => !isSupportedByTBTC(type),
    )

    describe.each(notSupportedAddresses)(
      "when it is $type $network address",
      ({ network, address }) => {
        const spyOnAddressToOutputScript = jest.spyOn(
          BitcoinAddressConverter,
          "addressToOutputScript",
        )
        let spyOnIsP2WSHScript: jest.SpyInstance<boolean>
        let spyOnIsP2SHScript: jest.SpyInstance<boolean>
        let result: boolean

        beforeAll(() => {
          spyOnIsP2WSHScript = jest.spyOn(BitcoinScriptUtils, "isP2WSHScript")
          spyOnIsP2SHScript = jest.spyOn(BitcoinScriptUtils, "isP2SHScript")

          result = isPayToScriptHashTypeAddress(address, network)
        })

        it("should not be able to convert address to output script", () => {
          expect(spyOnAddressToOutputScript).toThrow()
        })

        it("should not check if an address is P2WSH or P2WSH", () => {
          expect(spyOnIsP2WSHScript).not.toHaveBeenCalled()
          expect(spyOnIsP2SHScript).not.toHaveBeenCalled()
        })

        it("should return false", () => {
          expect(result).toBeFalsy()
        })
      },
    )
  })
})

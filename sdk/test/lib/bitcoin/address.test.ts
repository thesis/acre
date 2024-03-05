import { BitcoinAddressConverter } from "@keep-network/tbtc-v2.ts"
import { isPublicKeyHashTypeAddress } from "../../../src"
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
    // Should not convert addresses that are not supported by tBTC v2
    shouldConvertAddress: isSupportedByTBTC(address.type),
  }))

  describe.each(btcAddressesWithExpectedResult)(
    "when it is $type $network address",
    ({
      expectedResult,
      network,
      address,
      scriptPubKey,
      shouldConvertAddress,
    }) => {
      const spyOnAddressToOutputScript = jest.spyOn(
        BitcoinAddressConverter,
        "addressToOutputScript",
      )
      let result: boolean

      beforeAll(() => {
        result = isPublicKeyHashTypeAddress(address, network)
      })

      if (shouldConvertAddress) {
        it("should convert address to output script", () => {
          expect(spyOnAddressToOutputScript).toHaveBeenCalledWith(
            address,
            network,
          )
          expect(spyOnAddressToOutputScript).toHaveReturnedWith(scriptPubKey)
        })
      }

      it(`should return ${expectedResult}`, () => {
        expect(result).toBe(expectedResult)
      })
    },
  )
})

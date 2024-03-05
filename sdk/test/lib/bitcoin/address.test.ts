import { BitcoinAddressConverter } from "@keep-network/tbtc-v2.ts"
import { isPublicKeyHashTypeAddress } from "../../../src"
import { btcAddresses } from "./data"

describe("isPublicKeyHashTypeAddress", () => {
  const btcAddressesWithExpectedResult = btcAddresses.map((address) => ({
    ...address,
    expectedResult: address.type === "P2PKH" || address.type === "P2WPKH",
  }))
  describe.each(btcAddressesWithExpectedResult)(
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

import { isPublicKeyHashTypeAddress, BitcoinNetwork } from "../../../src"

const NATIVE_SEGWIT = "tb1qcurf0mwx8h3ttfp9la5dfa5lzncpfvkl0dscjd"
const LEGACY = "mneUnWAggR9kBj8fvfqdTe84y5v5BJSBFX"
const SEGWIT = "2NDzfWSP81zBXCHb2YNMt5i6XPzo4L3pm1n"

describe("isPublicKeyHashTypeAddress", () => {
  describe("when address is of type P2PKH or P2WPKH", () => {
    it("should return true", () => {
      const result = isPublicKeyHashTypeAddress(
        NATIVE_SEGWIT,
        BitcoinNetwork.Testnet,
      )

      expect(result).toBeTruthy()
    })

    it("should return true", () => {
      const result = isPublicKeyHashTypeAddress(LEGACY, BitcoinNetwork.Testnet)

      expect(result).toBeTruthy()
    })
  })

  describe("when address is of type P2SH", () => {
    it("should return false", () => {
      const result = isPublicKeyHashTypeAddress(SEGWIT, BitcoinNetwork.Testnet)

      expect(result).toBeFalsy()
    })
  })
})

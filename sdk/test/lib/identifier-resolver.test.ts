import { MockBitcoinProvider } from "../utils/mock-bitcoin-provider"
import { MockOrangeKitSdk } from "../utils/mock-orangekit"
import { EthereumAddress } from "../../src/lib/ethereum"
import AcreIdentifierResolver from "../../src/lib/identifier-resolver"

describe("AcreIdentifierResolver", () => {
  describe("toAcreIdentifier", () => {
    const bitcoinProvider = new MockBitcoinProvider()
    const orangeKit = new MockOrangeKitSdk()

    describe("when the identifier not yet cached", () => {
      const bitcoinAddress = "mjc2zGTypwNyDi4ZxGbBNnUA84bfgiwYc"
      const identifier = EthereumAddress.from(
        "0x766C69E751460070b160aF93Cbec51ccd77ff4A2",
      )
      let result: Awaited<
        ReturnType<typeof AcreIdentifierResolver.toAcreIdentifier>
      >

      beforeAll(async () => {
        bitcoinProvider.getAddress.mockResolvedValue(bitcoinAddress)
        orangeKit.predictAddress = jest
          .fn()
          .mockResolvedValue(`0x${identifier.identifierHex}`)

        result = await AcreIdentifierResolver.toAcreIdentifier(
          bitcoinProvider,
          // @ts-expect-error Error: Property '#private' is missing in type
          // 'MockOrangeKitSdk' but required in type 'OrangeKitSdk'.
          orangeKit,
        )
      })

      afterAll(() => {
        bitcoinProvider.getAddress.mockClear()
      })

      it("should get the bitcoin address", () => {
        expect(bitcoinProvider.getAddress).toHaveBeenCalled()
      })

      it("should call orangekit to predict the address", () => {
        expect(orangeKit.predictAddress).toHaveBeenCalledWith(bitcoinAddress)
      })

      it("should return the correct identifier", () => {
        expect(result.identifier.equals(identifier)).toBeTruthy()
        expect(result.associatedBitcoinAddress).toBe(bitcoinAddress)
      })
    })

    describe("when the identifier is already cached", () => {
      const bitcoinAddress = "mwyc4iaVjyL9xif9MyG7RuCvD3qizEiChY"
      const identifier = EthereumAddress.from(
        "0x8fC860a219A401BCe1Fb97EB510Efb35f59c8211",
      )
      let result: Awaited<
        ReturnType<typeof AcreIdentifierResolver.toAcreIdentifier>
      >

      beforeAll(async () => {
        bitcoinProvider.getAddress.mockResolvedValue(bitcoinAddress)
        orangeKit.predictAddress = jest
          .fn()
          .mockResolvedValue(`0x${identifier.identifierHex}`)

        await AcreIdentifierResolver.toAcreIdentifier(
          bitcoinProvider,
          // @ts-expect-error Error: Property '#private' is missing in type
          // 'MockOrangeKitSdk' but required in type 'OrangeKitSdk'.
          orangeKit,
        )

        result = await AcreIdentifierResolver.toAcreIdentifier(
          bitcoinProvider,
          // @ts-expect-error Error: Property '#private' is missing in type
          // 'MockOrangeKitSdk' but required in type 'OrangeKitSdk'.
          orangeKit,
        )
      })

      it("should get the bitcoin address", () => {
        expect(bitcoinProvider.getAddress).toHaveBeenCalledTimes(2)
      })

      it("should call the orangekit SDK only once", () => {
        expect(orangeKit.predictAddress).toHaveReturnedTimes(1)
      })

      it("should return the correct identifier", () => {
        expect(result.identifier.equals(identifier)).toBeTruthy()
        expect(result.associatedBitcoinAddress).toBe(bitcoinAddress)
      })
    })
  })
})

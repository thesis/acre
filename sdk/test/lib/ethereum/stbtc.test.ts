import ethers, { Contract } from "ethers"
import { EthereumStBTC } from "../../../src/lib/ethereum/stbtc"
import { EthereumAddress, EthereumSigner } from "../../../src"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("stbtc", () => {
  let stbtc: EthereumStBTC

  const mockedContractInstance = {
    balanceOf: jest.fn(),
    assetsBalanceOf: jest.fn(),
  }

  beforeAll(() => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    stbtc = new EthereumStBTC(
      {
        signer: {} as EthereumSigner,
      },
      "sepolia",
    )
  })

  describe("balanceOf", () => {
    const expectedResult = 4294967295n

    const depositorAddress = EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    )

    beforeAll(() => {
      mockedContractInstance.balanceOf = jest
        .fn()
        .mockResolvedValue(expectedResult)
    })

    it("should return final BTC balance", async () => {
      const result = await stbtc.balanceOf(depositorAddress)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("assetsBalanceOf", () => {
    const expectedResult = 4294967295n

    const depositorAddress = EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    )

    beforeAll(() => {
      mockedContractInstance.assetsBalanceOf = jest
        .fn()
        .mockResolvedValue(expectedResult)
    })

    it("should return maximum withdraw value", async () => {
      const result = await stbtc.assetsBalanceOf(depositorAddress)
      expect(result).toEqual(expectedResult)
    })
  })
})

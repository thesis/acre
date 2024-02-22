import ethers, { Contract } from "ethers"
import { EthereumStBTC } from "../../../src/lib/ethereum/stbtc"
import { EthereumAddress, EthereumSigner } from "../../../src"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("stbtc", () => {
  let depositor: EthereumStBTC
  let depositorAddress: EthereumAddress
  const vaultAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )
  const mockedContractInstance = {
    tbtcVault: jest.fn().mockImplementation(() => vaultAddress.identifierHex),
    initializeStakeRequest: jest.fn(),
  }

  beforeEach(async () => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    depositorAddress = EthereumAddress.from(
      await ethers.Wallet.createRandom().getAddress(),
    )

    depositor = new EthereumStBTC(
      {
        signer: {} as EthereumSigner,
        address: depositorAddress.identifierHex,
      },
      "sepolia",
    )
  })

  describe("balanceOf", () => {
    beforeAll(() => {
      depositor.balanceOf = jest.fn().mockResolvedValue(4294967295)
    })

    it("should return final BTC balance", async () => {
      const result = await depositor.balanceOf(vaultAddress)
      expect(result).toEqual(4294967295)
    })
  })

  describe("assetsBalanceOf", () => {
    beforeAll(() => {
      depositor.assetsBalanceOf = jest.fn().mockResolvedValue(4294967295)
    })

    it("should return maximum withdraw value", async () => {
      const result = await depositor.assetsBalanceOf(vaultAddress)
      expect(result).toEqual(4294967295)
    })
  })
})

import ethers, { Contract, Signer } from "ethers"
import { EthereumTBTCDepositor } from "../../../src/lib/ethereum/tbtc-depositor"
import { EthereumAddress } from "../../../src/lib/ethereum/address"

jest.mock("ethers", () => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("TBTCDepositor", () => {
  let depositor: EthereumTBTCDepositor
  let depositorAddress: string
  const mockedContractInstance = {
    tbtcVault: jest.fn(),
    initializeStake: jest.fn(),
  }

  beforeEach(async () => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    // TODO: get the address from artifact imported from `core` package.
    depositorAddress = await ethers.Wallet.createRandom().getAddress()

    depositor = new EthereumTBTCDepositor({
      signer: {} as Signer,
      address: depositorAddress,
    })
  })

  describe("getChainIdentifier", () => {
    it("should return contract address", () => {
      const result = `0x${depositor.getChainIdentifier().identifierHex}`

      expect(result).toBe(depositorAddress)
    })
  })

  describe("getTbtcVaultChainIdentifier", () => {
    let vaultAddress: string

    beforeEach(async () => {
      vaultAddress = await ethers.Wallet.createRandom().getAddress()

      mockedContractInstance.tbtcVault.mockReturnValue(vaultAddress)
    })

    it("should return correct tBTC vault address", async () => {
      const address = await depositor.getTbtcVaultChainIdentifier()

      expect(address.identifierHex).toBe(
        EthereumAddress.from(vaultAddress).identifierHex,
      )
    })
  })
})

import ethers, { Contract } from "ethers"
import BitcoinRedeemer from "@acre-btc/contracts/deployments/sepolia/BitcoinRedeemer.json"
import {
  EthereumAddress,
  EthereumSigner,
  EthereumBitcoinRedeemer,
} from "../../../src/lib/ethereum"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

jest.mock(
  "@acre-btc/contracts/deployments/sepolia/BitcoinRedeemer.json",
  () => ({
    address: "0xEa887C9de098BD7110EA638cEc91cc8d345b06C0",
    abi: [],
  }),
)

describe("BitcoinRedeemer", () => {
  let bitcoinRedeemer: EthereumBitcoinRedeemer

  const mockedContractInstance = {}

  beforeAll(() => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    bitcoinRedeemer = new EthereumBitcoinRedeemer(
      {
        signer: {} as EthereumSigner,
      },
      "sepolia",
    )
  })

  describe("getChainIdentifier", () => {
    it("should return contract address", () => {
      const result = bitcoinRedeemer.getChainIdentifier()

      expect(
        result.equals(EthereumAddress.from(BitcoinRedeemer.address)),
      ).toBeTruthy()
    })
  })
})

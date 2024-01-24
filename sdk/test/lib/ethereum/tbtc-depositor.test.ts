import ethers, { Contract } from "ethers"
import { EthereumTBTCDepositor } from "../../../src/lib/ethereum/tbtc-depositor"
import { EthereumAddress } from "../../../src/lib/ethereum/address"
import { Hex } from "../../../src/lib/utils"
import { EthereumSigner } from "../../../src/lib/ethereum"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("TBTCDepositor", () => {
  const vaultAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )
  const mockedContractInstance = {
    tbtcVault: jest.fn().mockImplementation(() => vaultAddress.identifierHex),
    initializeStake: jest.fn(),
  }
  let depositor: EthereumTBTCDepositor
  let depositorAddress: EthereumAddress

  beforeEach(async () => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    // TODO: get the address from artifact imported from `core` package.
    depositorAddress = EthereumAddress.from(
      await ethers.Wallet.createRandom().getAddress(),
    )

    depositor = new EthereumTBTCDepositor({
      signer: {} as EthereumSigner,
      address: depositorAddress.identifierHex,
    })
  })

  describe("getChainIdentifier", () => {
    it("should return contract address", () => {
      const result = depositor.getChainIdentifier()

      expect(result.equals(depositorAddress)).toBeTruthy()
    })
  })

  describe("getTbtcVaultChainIdentifier", () => {
    it("should return correct tBTC vault address", async () => {
      const address = await depositor.getTbtcVaultChainIdentifier()

      expect(address.equals(vaultAddress)).toBeTruthy()
    })
  })

  describe("initializeStake", () => {
    const bitcoinFundingTransaction = {
      version: Hex.from("00000000"),
      inputs: Hex.from("11111111"),
      outputs: Hex.from("22222222"),
      locktime: Hex.from("33333333"),
    }
    const depositReveal = {
      fundingOutputIndex: 2,
      walletPublicKeyHash: Hex.from("8db50eb52063ea9d98b3eac91489a90f738986f6"),
      refundPublicKeyHash: Hex.from("28e081f285138ccbe389c1eb8985716230129f89"),
      blindingFactor: Hex.from("f9f0c90d00039523"),
      refundLocktime: Hex.from("60bcea61"),
    }
    const referral = 0
    const mockedTx = Hex.from(
      "0483fe6a05f245bccc7b10085f3c4d282d87ca42f27437d077acfd75e91183a0",
    )
    let receiver: EthereumAddress
    let result: Hex

    beforeAll(async () => {
      receiver = EthereumAddress.from(
        await ethers.Wallet.createRandom().getAddress(),
      )

      mockedContractInstance.initializeStake.mockReturnValue({
        hash: mockedTx.toPrefixedString(),
      })

      result = await depositor.initializeStake(
        bitcoinFundingTransaction,
        depositReveal,
        receiver,
        0,
      )
    })

    it("should get the vault address", () => {
      expect(mockedContractInstance.tbtcVault).toHaveBeenCalled()
    })

    it("should initialize stake", () => {
      const btcTxInfo = {
        version: bitcoinFundingTransaction.version.toPrefixedString(),
        inputVector: bitcoinFundingTransaction.inputs.toPrefixedString(),
        outputVector: bitcoinFundingTransaction.outputs.toPrefixedString(),
        locktime: bitcoinFundingTransaction.locktime.toPrefixedString(),
      }

      const revealInfo = {
        fundingOutputIndex: depositReveal.fundingOutputIndex,
        blindingFactor: depositReveal.blindingFactor.toPrefixedString(),
        walletPubKeyHash: depositReveal.walletPublicKeyHash.toPrefixedString(),
        refundPubKeyHash: depositReveal.refundPublicKeyHash.toPrefixedString(),
        refundLocktime: depositReveal.refundLocktime.toPrefixedString(),
        vault: `0x${vaultAddress.identifierHex}`,
      }

      expect(mockedContractInstance.initializeStake).toHaveBeenCalledWith(
        btcTxInfo,
        revealInfo,
        `0x${receiver.identifierHex}`,
        referral,
      )
      expect(result.toPrefixedString()).toBe(mockedTx.toPrefixedString())
    })
  })
})

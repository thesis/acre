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
  const spyOnEthersDataSlice = jest.spyOn(ethers, "dataSlice")

  const vaultAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )

  const mockedContractInstance = {
    tbtcVault: jest.fn().mockImplementation(() => vaultAddress.identifierHex),
    initializeStakeRequest: jest.fn(),
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

  describe("revealDeposit", () => {
    const staker = EthereumAddress.from(
      "0x000055d85E80A49B5930C4a77975d44f012D86C1",
    )
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
      depositor: staker,
    }
    describe("when extra data is defined", () => {
      const extraData = {
        staker,
        referral: 6851,
        hex: Hex.from(
          "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
        ),
      }

      const depositWithExtraData = {
        ...depositReveal,
        extraData: extraData.hex,
      }

      const { referral } = extraData

      const mockedTx = Hex.from(
        "0483fe6a05f245bccc7b10085f3c4d282d87ca42f27437d077acfd75e91183a0",
      )
      let result: Hex

      beforeAll(async () => {
        mockedContractInstance.initializeStakeRequest.mockReturnValue({
          hash: mockedTx.toPrefixedString(),
        })

        const { fundingOutputIndex, ...restDepositData } = depositWithExtraData

        result = await depositor.revealDeposit(
          bitcoinFundingTransaction,
          fundingOutputIndex,
          restDepositData,
        )
      })

      it("should get the vault address", () => {
        expect(mockedContractInstance.tbtcVault).toHaveBeenCalled()
      })

      it("should decode extra data", () => {
        expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
          1,
          extraData.hex.toPrefixedString(),
          0,
          20,
        )
        expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
          2,
          extraData.hex.toPrefixedString(),
          20,
          22,
        )
      })

      it("should initialize stake request", () => {
        const btcTxInfo = {
          version: bitcoinFundingTransaction.version.toPrefixedString(),
          inputVector: bitcoinFundingTransaction.inputs.toPrefixedString(),
          outputVector: bitcoinFundingTransaction.outputs.toPrefixedString(),
          locktime: bitcoinFundingTransaction.locktime.toPrefixedString(),
        }

        const revealInfo = {
          fundingOutputIndex: depositReveal.fundingOutputIndex,
          blindingFactor: depositReveal.blindingFactor.toPrefixedString(),
          walletPubKeyHash:
            depositReveal.walletPublicKeyHash.toPrefixedString(),
          refundPubKeyHash:
            depositReveal.refundPublicKeyHash.toPrefixedString(),
          refundLocktime: depositReveal.refundLocktime.toPrefixedString(),
          vault: `0x${vaultAddress.identifierHex}`,
        }

        expect(
          mockedContractInstance.initializeStakeRequest,
        ).toHaveBeenCalledWith(
          btcTxInfo,
          revealInfo,
          `0x${staker.identifierHex}`,
          referral,
        )
        expect(result.toPrefixedString()).toBe(mockedTx.toPrefixedString())
      })
    })

    describe("when extra data not defined", () => {
      it("should throw an error", async () => {
        const { fundingOutputIndex, ...restDepositData } = depositReveal

        await expect(
          depositor.revealDeposit(
            bitcoinFundingTransaction,
            fundingOutputIndex,
            restDepositData,
          ),
        ).rejects.toThrow("Invalid extra data")
      })
    })
  })

  describe("encodeExtraData", () => {
    const extraData = {
      staker: EthereumAddress.from(
        "0x000055d85E80A49B5930C4a77975d44f012D86C1",
      ),
      referral: 6851,
      hex: "0x000055d85e80a49b5930c4a77975d44f012d86c11ac300000000000000000000",
    }
    const spyOnSolidityPacked = jest.spyOn(ethers, "solidityPacked")

    it("should return correct staker and referral", () => {
      const result = depositor.encodeExtraData(
        extraData.staker,
        extraData.referral,
      )

      expect(spyOnSolidityPacked).toHaveBeenCalledWith(
        ["address", "int16"],
        [`0x${extraData.staker.identifierHex}`, extraData.referral],
      )

      expect(result.toPrefixedString()).toEqual(extraData.hex)
    })
  })

  describe("decodeExtraData", () => {
    const extraData = {
      staker: EthereumAddress.from(
        "0xeb098d6cDE6A202981316b24B19e64D82721e89E",
      ),
      referral: 19712,
      hex: "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
    }
    beforeEach(() => {
      spyOnEthersDataSlice.mockClear()
    })

    it("should return correct staker and referral", () => {
      const { staker, referral } = depositor.decodeExtraData(extraData.hex)

      expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
        1,
        extraData.hex,
        0,
        20,
      )

      expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
        2,
        extraData.hex,
        20,
        22,
      )

      expect(staker.equals(extraData.staker)).toBeTruthy()
      expect(referral).toBe(extraData.referral)
    })
  })
})

import ethers, { Contract, ZeroAddress } from "ethers"
import {
  EthereumBitcoinDepositor,
  EthereumAddress,
  Hex,
  EthereumSigner,
} from "../../../src"
import { extraDataValidTestData } from "./data"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

describe("BitcoinDepositor", () => {
  const spyOnEthersDataSlice = jest.spyOn(ethers, "dataSlice")

  const vaultAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )
  const minDepositAmount = BigInt(0.015 * 1e18)

  const mockedContractInstance = {
    tbtcVault: jest.fn().mockImplementation(() => vaultAddress.identifierHex),
    initializeDeposit: jest.fn(),
    minDepositAmount: jest.fn().mockImplementation(() => minDepositAmount),
  }
  let depositor: EthereumBitcoinDepositor
  let depositorAddress: EthereumAddress

  beforeEach(async () => {
    jest
      .spyOn(ethers, "Contract")
      .mockImplementationOnce(
        () => mockedContractInstance as unknown as Contract,
      )

    // TODO: get the address from artifact imported from `solidity` package.
    depositorAddress = EthereumAddress.from(
      await ethers.Wallet.createRandom().getAddress(),
    )

    depositor = new EthereumBitcoinDepositor(
      {
        signer: {} as EthereumSigner,
        address: depositorAddress.identifierHex,
      },
      "sepolia",
    )
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
    const depositOwner = EthereumAddress.from(
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
      depositor: depositOwner,
    }
    describe("when extra data is defined", () => {
      const extraData = {
        depositOwner,
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
        mockedContractInstance.initializeDeposit.mockReturnValue({
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

      it("should initialize deposit", () => {
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

        expect(mockedContractInstance.initializeDeposit).toHaveBeenCalledWith(
          btcTxInfo,
          revealInfo,
          `0x${depositOwner.identifierHex}`,
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
    const spyOnSolidityPacked = jest.spyOn(ethers, "solidityPacked")

    it.each(extraDataValidTestData)(
      "$testDescription",
      ({ depositOwner, referral, extraData }) => {
        const result = depositor.encodeExtraData(depositOwner, referral)

        expect(spyOnSolidityPacked).toHaveBeenCalledWith(
          ["address", "uint16"],
          [`0x${depositOwner.identifierHex}`, referral],
        )

        expect(result.toPrefixedString()).toEqual(extraData)
      },
    )

    describe("when deposit owner is zero address", () => {
      const depositOwner = EthereumAddress.from(ZeroAddress)

      beforeEach(() => {
        spyOnSolidityPacked.mockClear()
      })

      it("should throw an error", () => {
        expect(() => {
          depositor.encodeExtraData(depositOwner, 0)
        }).toThrow("Invalid deposit owner address")
        expect(spyOnSolidityPacked).not.toHaveBeenCalled()
      })
    })
  })

  describe("decodeExtraData", () => {
    beforeEach(() => {
      spyOnEthersDataSlice.mockClear()
    })

    it.each(extraDataValidTestData)(
      "$testDescription",
      ({
        depositOwner: expectedDepositOwner,
        extraData,
        referral: expectedReferral,
      }) => {
        const { depositOwner, referral } = depositor.decodeExtraData(extraData)

        expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
          1,
          extraData,
          0,
          20,
        )

        expect(spyOnEthersDataSlice).toHaveBeenNthCalledWith(
          2,
          extraData,
          20,
          22,
        )

        expect(expectedDepositOwner.equals(depositOwner)).toBeTruthy()
        expect(expectedReferral).toBe(referral)
      },
    )
  })

  describe("minDepositAmount", () => {
    it("should return minimum deposit amount", async () => {
      const result = await depositor.minDepositAmount()

      expect(result).toEqual(minDepositAmount)
    })
  })
})

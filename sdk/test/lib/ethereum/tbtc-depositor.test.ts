import ethers, { Contract, ZeroAddress, getAddress } from "ethers"
import {
  EthereumBitcoinDepositor,
  EthereumAddress,
  Hex,
  EthereumSigner,
  DepositFees,
} from "../../../src"
import { extraDataValidTestData } from "./data"

jest.mock("ethers", (): object => ({
  Contract: jest.fn(),
  ...jest.requireActual("ethers"),
}))

const testData = {
  depositorFeeDivisor: 1000n,
  depositParameters: {
    depositTreasuryFeeDivisor: 2_000n, // 1/2000 == 5bps == 0.05% == 0.0005
    depositTxMaxFee: 100_000n, // 100000 satoshi = 0.001 BTC
  },
  optimisticMintingFeeDivisor: 500n, // 1/500 = 0.002 = 0.2%
}

describe("BitcoinDepositor", () => {
  const spyOnEthersDataSlice = jest.spyOn(ethers, "dataSlice")
  const spyOnEthersContract = jest.spyOn(ethers, "Contract")

  const vaultAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )
  const bridgeAddress = EthereumAddress.from(
    ethers.Wallet.createRandom().address,
  )

  const minDepositAmount = BigInt(0.015 * 1e18)

  const mockedContractInstance = {
    tbtcVault: jest
      .fn()
      .mockImplementation(() => `0x${vaultAddress.identifierHex}`),
    initializeDeposit: jest.fn(),
    bridge: jest.fn().mockResolvedValue(`0x${bridgeAddress.identifierHex}`),
    depositorFeeDivisor: jest
      .fn()
      .mockResolvedValue(testData.depositorFeeDivisor),
    minDepositAmount: jest.fn().mockImplementation(() => minDepositAmount),
  }

  let depositor: EthereumBitcoinDepositor
  let depositorAddress: EthereumAddress

  beforeAll(async () => {
    spyOnEthersContract.mockImplementationOnce(
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

  describe("estimateDepositFees", () => {
    const mockedBridgeContractInstance = {
      depositsParameters: jest
        .fn()
        .mockResolvedValue(testData.depositParameters),
    }

    const mockedVaultContractInstance = {
      optimisticMintingFeeDivisor: jest
        .fn()
        .mockResolvedValue(testData.optimisticMintingFeeDivisor),
    }

    const amountToStake = 100000000000000000n // 0.1 in 1e18 token precision

    const expectedResult = {
      tbtc: {
        // The fee is calculated based on the initial funding
        // transaction amount. `amountToStake / depositTreasuryFeeDivisor`
        // 0.00005 tBTC in 1e18 precision.
        treasuryFee: 50000000000000n,
        // Maximum amount of BTC transaction fee that can
        // be incurred by each swept deposit being part of the given sweep
        // transaction.
        // 0.001 tBTC in 1e18 precision.
        depositTxMaxFee: 1000000000000000n,
        // The optimistic fee is a percentage AFTER
        // the treasury fee is cut:
        // `fee = (depositAmount - treasuryFee) / optimisticMintingFeeDivisor`
        // 0.0001999 tBTC in 1e18 precision.
        optimisticMintingFee: 199900000000000n,
      },
      acre: {
        // Divisor used to compute the depositor fee taken from each deposit
        // and transferred to the treasury upon stake request finalization.
        // `depositorFee = depositedAmount / depositorFeeDivisor`
        // 0.0001 tBTC in 1e18 precision.
        bitcoinDepositorFee: 100000000000000n,
      },
    }

    beforeAll(() => {
      spyOnEthersContract.mockClear()

      spyOnEthersContract.mockImplementation((target: string) => {
        if (getAddress(target) === getAddress(bridgeAddress.identifierHex))
          return mockedBridgeContractInstance as unknown as Contract
        if (getAddress(target) === getAddress(vaultAddress.identifierHex))
          return mockedVaultContractInstance as unknown as Contract

        throw new Error("Cannot create mocked contract instance")
      })
    })

    describe("when network fees are not yet cached", () => {
      let result: DepositFees

      beforeAll(async () => {
        result = await depositor.calculateDepositFee(amountToStake)
      })

      it("should get the bridge contract address", () => {
        expect(mockedContractInstance.bridge).toHaveBeenCalled()
      })

      it("should create the ethers Contract instance of the Bridge contract", () => {
        expect(Contract).toHaveBeenNthCalledWith(
          1,
          `0x${bridgeAddress.identifierHex}`,
          ["function depositsParameters()"],
        )
      })

      it("should get the deposit parameters from chain", () => {
        expect(
          mockedBridgeContractInstance.depositsParameters,
        ).toHaveBeenCalled()
      })

      it("should get the vault contract address", () => {
        expect(mockedContractInstance.tbtcVault).toHaveBeenCalled()
      })

      it("should create the ethers Contract instance of the Bridge contract", () => {
        expect(Contract).toHaveBeenNthCalledWith(
          2,
          `0x${vaultAddress.identifierHex}`,
          ["function optimisticMintingFeeDivisor()"],
        )
      })

      it("should get the optimistic minting fee divisor", () => {
        expect(
          mockedVaultContractInstance.optimisticMintingFeeDivisor,
        ).toHaveBeenCalled()
      })

      it("should get the depositor fee divisor", () => {
        expect(mockedContractInstance.depositorFeeDivisor).toHaveBeenCalled()
      })

      it("should return correct fees", () => {
        expect(result).toMatchObject(expectedResult)
      })
    })

    describe("when network fees are already cached", () => {
      let result2: DepositFees

      beforeAll(async () => {
        mockedContractInstance.bridge.mockClear()
        mockedContractInstance.tbtcVault.mockClear()
        mockedContractInstance.depositorFeeDivisor.mockClear()
        mockedBridgeContractInstance.depositsParameters.mockClear()
        mockedVaultContractInstance.optimisticMintingFeeDivisor.mockClear()

        result2 = await depositor.calculateDepositFee(amountToStake)
      })

      it("should get the deposit parameters from cache", () => {
        expect(mockedContractInstance.bridge).toHaveBeenCalledTimes(0)
        expect(
          mockedBridgeContractInstance.depositsParameters,
        ).toHaveBeenCalledTimes(0)
      })

      it("should get the optimistic minting fee divisor from cache", () => {
        expect(mockedContractInstance.tbtcVault).toHaveBeenCalledTimes(0)
        expect(
          mockedVaultContractInstance.optimisticMintingFeeDivisor,
        ).toHaveBeenCalledTimes(0)
      })

      it("should get the bitcoin depositor fee divisor from cache", () => {
        expect(
          mockedContractInstance.depositorFeeDivisor,
        ).toHaveBeenCalledTimes(0)
      })

      it("should return correct fees", () => {
        expect(result2).toMatchObject(expectedResult)
      })
    })
  })

  describe("minDepositAmount", () => {
    it("should return minimum deposit amount", async () => {
      const result = await depositor.minDepositAmount()

      expect(result).toEqual(minDepositAmount)
    })
  })
})

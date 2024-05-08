import { BitcoinTxHash } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import {
  AcreContracts,
  StakingModule,
  Hex,
  StakeInitialization,
  EthereumAddress,
  DepositFees,
  DepositFee,
} from "../../src"
import * as satoshiConverter from "../../src/lib/utils/satoshi-converter"
import { MockAcreContracts } from "../utils/mock-acre-contracts"
import { MockMessageSigner } from "../utils/mock-message-signer"
import { MockTbtc } from "../utils/mock-tbtc"
import { DepositReceipt } from "../../src/modules/tbtc"

const stakingModuleData: {
  initializeStake: {
    staker: EthereumAddress
    referral: number
    extraData: Hex
    bitcoinRecoveryAddress: string
    mockedDepositBTCAddress: string
  }
  estimateDepositFees: {
    amount: bigint
    amountIn1e18: bigint
    mockedDepositFees: DepositFees
    stBTCDepositFee: bigint
    expectedDepositFeesInSatoshi: DepositFee
  }
} = {
  initializeStake: {
    staker: EthereumAddress.from(ethers.Wallet.createRandom().address),
    referral: 1,
    extraData: Hex.from(
      "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
    ),
    bitcoinRecoveryAddress: "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
    mockedDepositBTCAddress:
      "tb1qma629cu92skg0t86lftyaf9uflzwhp7jk63h6mpmv3ezh6puvdhs6w2r05",
  },
  estimateDepositFees: {
    amount: 10_000_000n, // 0.1 BTC,
    // 0.1 tBTC in 1e18 precision.
    amountIn1e18: 100000000000000000n,
    mockedDepositFees: {
      tbtc: {
        // 0.00005 tBTC in 1e18 precision.
        treasuryFee: 50000000000000n,
        // 0.001 tBTC in 1e18 precision.
        depositTxMaxFee: 1000000000000000n,
        // 0.0001999 tBTC in 1e18 precision.
        optimisticMintingFee: 199900000000000n,
      },
      acre: {
        // 0.0001 tBTC in 1e18 precision.
        bitcoinDepositorFee: 100000000000000n,
      },
    },
    // 0.001 in 1e18 precison
    stBTCDepositFee: 1000000000000000n,
    expectedDepositFeesInSatoshi: {
      tbtc: 124990n,
      acre: 110000n,
      total: 234990n,
    },
  },
}

const stakingInitializationData: {
  depositReceipt: Omit<DepositReceipt, "depositor">
  mockedInitializeTxHash: Hex
  mockedDepositId: string
  fundingUtxo: {
    transactionHash: BitcoinTxHash
    outputIndex: number
    value: bigint
  }
} = {
  depositReceipt: {
    blindingFactor: Hex.from("555555"),
    walletPublicKeyHash: Hex.from("666666"),
    refundPublicKeyHash: Hex.from("0x2cd680318747b720d67bf4246eb7403b476adb34"),
    refundLocktime: Hex.from("888888"),
    extraData: stakingModuleData.initializeStake.extraData,
  },
  mockedInitializeTxHash: Hex.from("999999"),
  mockedDepositId: "deposit-id-1234",
  fundingUtxo: {
    transactionHash: BitcoinTxHash.from(
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ),
    outputIndex: 1,
    value: 2222n,
  },
}

describe("Staking", () => {
  const contracts: AcreContracts = new MockAcreContracts()
  const messageSigner = new MockMessageSigner()
  const tbtc = new MockTbtc()

  const staking: StakingModule = new StakingModule(
    contracts,
    messageSigner,
    tbtc,
  )

  describe("initializeStake", () => {
    const {
      mockedDepositBTCAddress,
      bitcoinRecoveryAddress,
      staker,
      referral,
      extraData,
    } = stakingModuleData.initializeStake

    const { mockedDepositId } = stakingInitializationData

    const mockedDeposit = {
      getBitcoinAddress: jest.fn().mockResolvedValue(mockedDepositBTCAddress),
      waitForFunding: jest.fn(),
      getReceipt: jest.fn().mockReturnValue({ extraData }),
      createDeposit: jest.fn().mockReturnValue(mockedDepositId),
    }

    describe("with default depositor proxy implementation", () => {
      const mockedSignedMessage = { verify: jest.fn() }

      let result: StakeInitialization

      beforeEach(async () => {
        contracts.bitcoinDepositor.decodeExtraData = jest
          .fn()
          .mockReturnValue({ staker, referral })

        contracts.bitcoinDepositor.encodeExtraData = jest
          .fn()
          .mockReturnValue(extraData)

        tbtc.initiateDeposit = jest.fn().mockReturnValue(mockedDeposit)

        messageSigner.sign = jest.fn().mockResolvedValue(mockedSignedMessage)

        result = await staking.initializeStake(
          bitcoinRecoveryAddress,
          staker,
          referral,
        )
      })

      it("should initiate tBTC deposit", () => {
        expect(tbtc.initiateDeposit).toHaveBeenCalledWith(
          staker,
          bitcoinRecoveryAddress,
          referral,
        )
      })

      it("should return stake initialization object", () => {
        expect(result).toBeInstanceOf(StakeInitialization)
        expect(result.getBitcoinAddress).toBeDefined()
        expect(result.getDepositReceipt).toBeDefined()
        expect(result.stake).toBeDefined()
        expect(result.signMessage).toBeDefined()
      })

      describe("StakeInitialization", () => {
        const { depositReceipt } = stakingInitializationData

        beforeAll(() => {
          mockedDeposit.getReceipt.mockReturnValue(depositReceipt)
        })

        describe("getBitcoinAddress", () => {
          it("should return bitcoin deposit address", async () => {
            expect(await result.getBitcoinAddress()).toBe(
              mockedDepositBTCAddress,
            )
          })
        })

        describe("getDepositReceipt", () => {
          it("should return tbtc deposit receipt", () => {
            expect(result.getDepositReceipt()).toBe(depositReceipt)
            expect(mockedDeposit.getReceipt).toHaveBeenCalled()
          })
        })

        describe("signMessage", () => {
          describe("when signing by valid staker", () => {
            const depositorAddress = ethers.Wallet.createRandom().address

            beforeEach(async () => {
              mockedSignedMessage.verify.mockReturnValue(staker)
              contracts.bitcoinDepositor.getChainIdentifier = jest
                .fn()
                .mockReturnValue(EthereumAddress.from(depositorAddress))

              await result.signMessage()
            })

            it("should sign message", () => {
              expect(messageSigner.sign).toHaveBeenCalledWith(
                {
                  name: "BitcoinDepositor",
                  version: "1",
                  verifyingContract:
                    contracts.bitcoinDepositor.getChainIdentifier(),
                },
                {
                  Stake: [
                    { name: "ethereumStakerAddress", type: "address" },
                    { name: "bitcoinRecoveryAddress", type: "string" },
                  ],
                },
                {
                  ethereumStakerAddress: staker.identifierHex,
                  bitcoinRecoveryAddress,
                },
              )
            })

            it("should verify signed message", () => {
              expect(mockedSignedMessage.verify).toHaveBeenCalled()
            })
          })

          describe("when signing by invalid staker", () => {
            const invalidStaker = EthereumAddress.from(
              ethers.Wallet.createRandom().address,
            )

            beforeEach(() => {
              mockedSignedMessage.verify = jest
                .fn()
                .mockResolvedValue(invalidStaker)
            })

            it("should throw an error", async () => {
              await expect(result.signMessage()).rejects.toThrow(
                "Invalid staker address",
              )
            })
          })
        })

        describe("stake", () => {
          beforeAll(() => {
            mockedSignedMessage.verify.mockReturnValue(staker)
          })

          describe("when the message has not been signed yet", () => {
            it("should throw an error", async () => {
              await expect(result.stake()).rejects.toThrow("Sign message first")
            })
          })

          describe("when message has already been signed", () => {
            let depositId: string

            beforeAll(async () => {
              mockedDeposit.waitForFunding.mockResolvedValue(undefined)
              await result.signMessage()

              depositId = await result.stake()
            })

            it("should wait for funding", () => {
              expect(mockedDeposit.waitForFunding).toHaveBeenCalled()
            })

            it("should create the deposit", () => {
              expect(mockedDeposit.createDeposit).toHaveBeenCalled()
            })

            it("should return deposit id", () => {
              expect(depositId).toBe(mockedDepositId)
            })
          })
        })
      })
    })
  })

  describe("sharesBalance", () => {
    const { staker } = stakingModuleData.initializeStake
    const expectedResult = 4294967295n
    let result: bigint

    beforeAll(async () => {
      contracts.stBTC.balanceOf = jest.fn().mockResolvedValue(expectedResult)
      result = await staking.sharesBalance(staker)
    })

    it("should get balance of stBTC", () => {
      expect(contracts.stBTC.balanceOf).toHaveBeenCalledWith(staker)
    })

    it("should return value of the basis for calculating final BTC balance", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("estimatedBitcoinBalance", () => {
    const expectedResult = 4294967295n
    const { staker } = stakingModuleData.initializeStake
    let result: bigint
    beforeAll(async () => {
      contracts.stBTC.assetsBalanceOf = jest
        .fn()
        .mockResolvedValue(expectedResult)
      result = await staking.estimatedBitcoinBalance(staker)
    })

    it("should get staker's balance of tBTC tokens in vault ", () => {
      expect(contracts.stBTC.assetsBalanceOf).toHaveBeenCalledWith(staker)
    })

    it("should return maximum withdraw value", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("estimateDepositFees", () => {
    const {
      estimateDepositFees: {
        amount,
        amountIn1e18,
        mockedDepositFees,
        expectedDepositFeesInSatoshi,
        stBTCDepositFee,
      },
    } = stakingModuleData

    let result: DepositFee
    const spyOnToSatoshi = jest.spyOn(satoshiConverter, "toSatoshi")
    const spyOnFromSatoshi = jest.spyOn(satoshiConverter, "fromSatoshi")

    beforeAll(async () => {
      contracts.bitcoinDepositor.calculateDepositFee = jest
        .fn()
        .mockResolvedValue(mockedDepositFees)

      contracts.stBTC.calculateDepositFee = jest
        .fn()
        .mockResolvedValue(stBTCDepositFee)

      result = await staking.estimateDepositFee(amount)
    })

    it("should convert provided amount from satoshi to token precision", () => {
      expect(spyOnFromSatoshi).toHaveBeenNthCalledWith(1, amount)
    })

    it("should get the deposit fees from Acre Bitcoin Depositor contract handle", () => {
      expect(
        contracts.bitcoinDepositor.calculateDepositFee,
      ).toHaveBeenCalledWith(amountIn1e18)
    })

    it("should get the stBTC deposit fee", () => {
      expect(contracts.stBTC.calculateDepositFee).toHaveBeenCalledWith(
        amountIn1e18,
      )
    })

    it("should convert tBTC network fees to satoshi", () => {
      const {
        tbtc: { depositTxMaxFee, treasuryFee, optimisticMintingFee },
      } = mockedDepositFees
      const totalTbtcFees = depositTxMaxFee + treasuryFee + optimisticMintingFee

      expect(spyOnToSatoshi).toHaveBeenNthCalledWith(1, totalTbtcFees)
    })

    it("should convert Acre network fees to satoshi", () => {
      const {
        acre: { bitcoinDepositorFee },
      } = mockedDepositFees
      const totalAcreFees = bitcoinDepositorFee

      expect(spyOnToSatoshi).toHaveBeenNthCalledWith(2, totalAcreFees)
    })

    it("should return the deposit fees in satoshi precision", () => {
      expect(result).toMatchObject(expectedDepositFeesInSatoshi)
    })
  })

  describe("minDepositAmount", () => {
    describe("should return minimum deposit amount", () => {
      const spyOnToSatoshi = jest.spyOn(satoshiConverter, "toSatoshi")
      const mockedResult = BigInt(0.015 * 1e18)
      // The returned result should be in satoshi precision
      const expectedResult = BigInt(0.015 * 1e8)
      let result: bigint

      beforeAll(async () => {
        contracts.bitcoinDepositor.minDepositAmount = jest
          .fn()
          .mockResolvedValue(mockedResult)
        result = await staking.minDepositAmount()
      })

      it("should convert value to 1e8 satoshi precision", () => {
        expect(spyOnToSatoshi).toHaveBeenCalledWith(mockedResult)
        expect(spyOnToSatoshi).toHaveReturnedWith(expectedResult)
      })

      it(`should return ${expectedResult}`, () => {
        expect(result).toBe(expectedResult)
      })
    })
  })
})

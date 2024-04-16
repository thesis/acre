import { BitcoinTxHash } from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import {
  AcreContracts,
  StakingModule,
  Hex,
  StakeInitialization,
  DepositorProxy,
  DepositReceipt,
  EthereumAddress,
  DepositFees,
  TotalDepositFees,
} from "../../src"
import * as satoshiConverter from "../../src/lib/utils/satoshi-converter"
import { MockAcreContracts } from "../utils/mock-acre-contracts"
import { MockMessageSigner } from "../utils/mock-message-signer"
import { MockTBTC } from "../utils/mock-tbtc"

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
    expectedDepositFeesInSatoshi: TotalDepositFees
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
  const tbtc = new MockTBTC()

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
    const mockedDeposit = {
      getBitcoinAddress: jest.fn().mockResolvedValue(mockedDepositBTCAddress),
      detectFunding: jest.fn(),
      getReceipt: jest.fn().mockReturnValue({ extraData }),
      initiateMinting: jest.fn(),
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

        tbtc.deposits.initiateDepositWithProxy = jest
          .fn()
          .mockReturnValue(mockedDeposit)

        messageSigner.sign = jest.fn().mockResolvedValue(mockedSignedMessage)

        result = await staking.initializeStake(
          bitcoinRecoveryAddress,
          staker,
          referral,
        )
      })

      it("should encode extra data", () => {
        expect(contracts.bitcoinDepositor.encodeExtraData(staker, referral))
      })

      it("should initiate tBTC deposit", () => {
        expect(tbtc.deposits.initiateDepositWithProxy).toHaveBeenCalledWith(
          bitcoinRecoveryAddress,
          contracts.bitcoinDepositor,
          extraData,
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

        describe("getDepositAddress", () => {
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
            let tx: Hex
            const { mockedInitializeTxHash: mockedTxHash, fundingUtxo } =
              stakingInitializationData

            beforeAll(async () => {
              mockedDeposit.initiateMinting.mockResolvedValue(mockedTxHash)
              mockedDeposit.detectFunding.mockResolvedValue([fundingUtxo])
              await result.signMessage()

              tx = await result.stake()
            })

            it("should stake tokens via tbtc depositor proxy", () => {
              expect(mockedDeposit.initiateMinting).toHaveBeenCalled()
            })

            it("should return transaction hash", () => {
              expect(tx).toBe(mockedTxHash)
            })
          })

          describe("when waiting for bitcoin deposit tx", () => {
            const { mockedInitializeTxHash: mockedTxHash } =
              stakingInitializationData

            describe("when can't find transaction after max number of retries", () => {
              beforeEach(async () => {
                jest.useFakeTimers()

                mockedDeposit.initiateMinting.mockResolvedValue(mockedTxHash)
                mockedDeposit.detectFunding.mockClear()
                mockedDeposit.detectFunding.mockResolvedValue([])

                await result.signMessage()
              })

              it("should throw an error", async () => {
                // eslint-disable-next-line no-void
                void expect(result.stake()).rejects.toThrow(
                  "Deposit not funded yet",
                )

                await jest.runAllTimersAsync()

                expect(mockedDeposit.detectFunding).toHaveBeenCalledTimes(6)
              })
            })

            describe("when the funding tx is available", () => {
              const { fundingUtxo } = stakingInitializationData
              let txPromise: Promise<Hex>

              beforeAll(async () => {
                jest.useFakeTimers()

                mockedDeposit.initiateMinting.mockResolvedValue(mockedTxHash)

                mockedDeposit.detectFunding.mockClear()
                mockedDeposit.detectFunding
                  // First attempt. Deposit not funded yet.
                  .mockResolvedValueOnce([])
                  // Second attempt. Deposit funded.
                  .mockResolvedValueOnce([fundingUtxo])

                await result.signMessage()

                txPromise = result.stake()

                await jest.runAllTimersAsync()
              })

              it("should wait for deposit transaction", () => {
                expect(mockedDeposit.detectFunding).toHaveBeenCalledTimes(2)
              })

              it("should stake tokens via tbtc depositor proxy", () => {
                expect(mockedDeposit.initiateMinting).toHaveBeenCalled()
              })

              it("should return transaction hash", async () => {
                const txHash = await txPromise

                expect(txHash).toBe(mockedTxHash)
              })
            })
          })
        })
      })
    })

    describe("with custom depositor proxy", () => {
      const customDepositorProxy: DepositorProxy = {
        getChainIdentifier: jest.fn(),
        revealDeposit: jest.fn(),
      } as unknown as DepositorProxy

      let result: StakeInitialization

      beforeEach(async () => {
        contracts.bitcoinDepositor.encodeExtraData = jest
          .fn()
          .mockReturnValue(extraData)

        tbtc.deposits.initiateDepositWithProxy = jest
          .fn()
          .mockReturnValue(mockedDeposit)

        result = await staking.initializeStake(
          bitcoinRecoveryAddress,
          staker,
          referral,
          customDepositorProxy,
        )
      })

      it("should initiate tBTC deposit", () => {
        expect(tbtc.deposits.initiateDepositWithProxy).toHaveBeenCalledWith(
          bitcoinRecoveryAddress,
          customDepositorProxy,
          extraData,
        )
      })

      it("should return stake initialization object", () => {
        expect(result).toBeInstanceOf(StakeInitialization)
        expect(result.getBitcoinAddress).toBeDefined()
        expect(result.stake).toBeDefined()
        expect(result.signMessage).toBeDefined()
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

    let result: TotalDepositFees
    const spyOnToSatoshi = jest.spyOn(satoshiConverter, "toSatoshi")
    const spyOnFromSatoshi = jest.spyOn(satoshiConverter, "fromSatoshi")

    beforeAll(async () => {
      contracts.bitcoinDepositor.estimateDepositFees = jest
        .fn()
        .mockResolvedValue(mockedDepositFees)

      contracts.stBTC.depositFee = jest.fn().mockResolvedValue(stBTCDepositFee)

      result = await staking.estimateDepositFees(amount)
    })

    it("should convert provided amount from satoshi to token precision", () => {
      expect(spyOnFromSatoshi).toHaveBeenNthCalledWith(1, amount)
    })

    it("should get the deposit fees from Acre Bitcoin Depositor contract handle", () => {
      expect(
        contracts.bitcoinDepositor.estimateDepositFees,
      ).toHaveBeenCalledWith(amountIn1e18)
    })

    it("should get the stBTC deposit fee", () => {
      expect(contracts.stBTC.depositFee).toHaveBeenCalledWith(amountIn1e18)
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

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
  DepositStatus,
} from "../../src"
import * as satoshiConverter from "../../src/lib/utils/satoshi-converter"
import { MockAcreContracts } from "../utils/mock-acre-contracts"
import { MockOrangeKitSdk } from "../utils/mock-orangekit"
import { MockTbtc } from "../utils/mock-tbtc"
import { DepositReceipt } from "../../src/modules/tbtc"
import { MockBitcoinProvider } from "../utils/mock-bitcoin-provider"
import AcreSubgraphApi from "../../src/lib/api/AcreSubgraphApi"

const stakingModuleData: {
  initializeDeposit: {
    referral: number
    extraData: Hex
    mockedDepositBTCAddress: string
    bitcoinDepositorAddress: string
    predictedEthereumDepositorAddress: EthereumAddress
  }
  estimateDepositFees: {
    amount: bigint
    amountIn1e18: bigint
    mockedDepositFees: DepositFees
    stBTCDepositFee: bigint
    expectedDepositFeesInSatoshi: DepositFee
  }
} = {
  initializeDeposit: {
    referral: 1,

    extraData: Hex.from(
      "0xeb098d6cde6a202981316b24b19e64d82721e89e4d0000000000000000000000",
    ),
    mockedDepositBTCAddress:
      "tb1qma629cu92skg0t86lftyaf9uflzwhp7jk63h6mpmv3ezh6puvdhs6w2r05",
    bitcoinDepositorAddress: "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
    predictedEthereumDepositorAddress: EthereumAddress.from(
      "0x9996baD9C879B1643Ac921454815F93BadA090AB",
    ),
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
    extraData: stakingModuleData.initializeDeposit.extraData,
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
  const bitcoinProvider = new MockBitcoinProvider()
  const orangeKit = new MockOrangeKitSdk()
  const tbtc = new MockTbtc()
  const acreSubgraph = new AcreSubgraphApi("test")

  const { bitcoinDepositorAddress, predictedEthereumDepositorAddress } =
    stakingModuleData.initializeDeposit

  bitcoinProvider.getAddress.mockResolvedValue(
    stakingModuleData.initializeDeposit.bitcoinDepositorAddress,
  )

  orangeKit.predictAddress = jest
    .fn()
    .mockResolvedValue(`0x${predictedEthereumDepositorAddress.identifierHex}`)

  const staking: StakingModule = new StakingModule(
    contracts,
    bitcoinProvider,
    // @ts-expect-error Error: Property '#private' is missing in type
    // 'MockOrangeKitSdk' but required in type 'OrangeKitSdk'.
    orangeKit,
    tbtc,
    acreSubgraph,
  )

  describe("initializeStake", () => {
    const { mockedDepositBTCAddress, referral, extraData } =
      stakingModuleData.initializeDeposit
    // TODO: Rename to `depositor`.
    const staker = predictedEthereumDepositorAddress

    const { mockedDepositId } = stakingInitializationData

    const mockedDeposit = {
      getBitcoinAddress: jest.fn().mockResolvedValue(mockedDepositBTCAddress),
      waitForFunding: jest.fn(),
      getReceipt: jest.fn().mockReturnValue({ extraData }),
      createDeposit: jest.fn().mockReturnValue(mockedDepositId),
    }

    describe.each([
      {
        bitcoinRecoveryAddress: undefined,
        description: "when the bitcoin recovery address is not defined",
      },
      {
        bitcoinRecoveryAddress: "tb1qumuaw3exkxdhtut0u85latkqfz4ylgwstkdzsx",
        description: "when the bitcoin recovery address is defined",
      },
    ])(
      "$description",
      ({ bitcoinRecoveryAddress: _bitcoinRecoveryAddress }) => {
        const mockedSignedMessage = { verify: jest.fn() }
        const bitcoinRecoveryAddress =
          _bitcoinRecoveryAddress ?? bitcoinDepositorAddress

        let result: StakeInitialization

        beforeEach(async () => {
          contracts.bitcoinDepositor.decodeExtraData = jest
            .fn()
            .mockReturnValue({ staker, referral })

          contracts.bitcoinDepositor.encodeExtraData = jest
            .fn()
            .mockReturnValue(extraData)

          tbtc.initiateDeposit = jest.fn().mockReturnValue(mockedDeposit)

          result = await staking.initializeStake(
            referral,
            bitcoinRecoveryAddress,
          )
        })

        it("should get the bitcoin address from bitcoin provider", () => {
          expect(bitcoinProvider.getAddress).toHaveBeenCalled()
        })

        it("should get Ethereum depositor owner address", () => {
          expect(orangeKit.predictAddress).toHaveBeenCalledWith(
            bitcoinDepositorAddress,
          )
        })

        it("should initiate tBTC deposit", () => {
          expect(tbtc.initiateDeposit).toHaveBeenCalledWith(
            predictedEthereumDepositorAddress,
            bitcoinRecoveryAddress,
            referral,
          )
        })

        it("should return stake initialization object", () => {
          expect(result).toBeInstanceOf(StakeInitialization)
          expect(result.getBitcoinAddress).toBeDefined()
          expect(result.getDepositReceipt).toBeDefined()
          expect(result.stake).toBeDefined()
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

          // describe("signMessage", () => {
          //   describe("when signing by valid staker", () => {
          //     const depositorAddress = ethers.Wallet.createRandom().address

          //     beforeEach(async () => {
          //       mockedSignedMessage.verify.mockReturnValue(
          //         predictedEthereumDepositorAddress,
          //       )
          //       contracts.bitcoinDepositor.getChainIdentifier = jest
          //         .fn()
          //         .mockReturnValue(EthereumAddress.from(depositorAddress))

          //       await result.signMessage()
          //     })

          //     it("should sign message", () => {
          //       expect(messageSigner.sign).toHaveBeenCalledWith(
          //         {
          //           name: "BitcoinDepositor",
          //           version: "1",
          //           verifyingContract:
          //             contracts.bitcoinDepositor.getChainIdentifier(),
          //         },
          //         {
          //           Stake: [
          //             { name: "ethereumStakerAddress", type: "address" },
          //             { name: "bitcoinRecoveryAddress", type: "string" },
          //           ],
          //         },
          //         {
          //           ethereumStakerAddress:
          //             predictedEthereumDepositorAddress.identifierHex,
          //           bitcoinRecoveryAddress: bitcoinDepositorAddress,
          //         },
          //       )
          //     })

          //     it("should verify signed message", () => {
          //       expect(mockedSignedMessage.verify).toHaveBeenCalled()
          //     })
          //   })

          //   describe("when signing by invalid staker", () => {
          //     const invalidStaker = EthereumAddress.from(
          //       ethers.Wallet.createRandom().address,
          //     )

          //     beforeEach(() => {
          //       mockedSignedMessage.verify = jest
          //         .fn()
          //         .mockResolvedValue(invalidStaker)
          //     })

          //     it("should throw an error", async () => {
          //       await expect(result.signMessage()).rejects.toThrow(
          //         "Invalid staker address",
          //       )
          //     })
          //   })
          // })

          describe("stake", () => {
            beforeAll(() => {
              mockedSignedMessage.verify.mockReturnValue(
                predictedEthereumDepositorAddress,
              )
            })

            // describe("when the message has not been signed yet", () => {
            //   it("should throw an error", async () => {
            //     await expect(result.stake()).rejects.toThrow(
            //       "Sign message first",
            //     )
            //   })
            // })

            describe("when message has already been signed", () => {
              let depositId: string

              beforeAll(async () => {
                mockedDeposit.waitForFunding.mockResolvedValue(undefined)

                result.signMessage()

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
      },
    )
  })

  describe("sharesBalance", () => {
    const depositor = EthereumAddress.from(ethers.Wallet.createRandom().address)

    const expectedResult = 4294967295n
    let result: bigint

    beforeAll(async () => {
      contracts.stBTC.balanceOf = jest.fn().mockResolvedValue(expectedResult)
      result = await staking.sharesBalance(depositor)
    })

    it("should get balance of stBTC", () => {
      expect(contracts.stBTC.balanceOf).toHaveBeenCalledWith(depositor)
    })

    it("should return value of the basis for calculating final BTC balance", () => {
      expect(result).toEqual(expectedResult)
    })
  })

  describe("estimatedBitcoinBalance", () => {
    const expectedResult = 4294967295n
    const depositor = EthereumAddress.from(ethers.Wallet.createRandom().address)
    let result: bigint
    beforeAll(async () => {
      contracts.stBTC.assetsBalanceOf = jest
        .fn()
        .mockResolvedValue(expectedResult)
      result = await staking.estimatedBitcoinBalance(depositor)
    })

    it("should get staker's balance of tBTC tokens in vault ", () => {
      expect(contracts.stBTC.assetsBalanceOf).toHaveBeenCalledWith(depositor)
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

  describe("getDeposits", () => {
    const finalizedDeposit = {
      subgraph: {
        depositKey:
          "0x73661e3ee3c6c30988800e5fedc081f29c6540505383fcfcd172fd10f3a73139",
        txHash:
          "6bca75ba55334c25064e7bf5333a3b39ed5bb73fb17e73ea9e55e6294e3fbf65",
        initialAmount: BigInt("1040000000000000"),
        amountToDeposit: BigInt("536361040000000"),
        type: "deposit",
        status: DepositStatus.Finalized,
      },
      tbtc: {
        depositKey:
          "0x73661e3ee3c6c30988800e5fedc081f29c6540505383fcfcd172fd10f3a73139",
        txHash:
          "6bca75ba55334c25064e7bf5333a3b39ed5bb73fb17e73ea9e55e6294e3fbf65",
        initialAmount: BigInt("1040000000000000"),
        status: DepositStatus.Finalized,
      },
    }

    const queuedDeposit = {
      txHash:
        "96c40dcd6ef25bd27f926dc396bb8f8e7365b4746870e2d186ff001d6693a3ff",
      depositKey:
        "0xc6c428b14cf7c3116603b355ad3ddf029ea5119a2699090c80f99b68dd40fea4",
      outputIndex: 0,
      initialAmount: BigInt("1050000000000000"),
      status: DepositStatus.Queued,
    }

    const spyOnSubgraphGetDeposits = jest
      .spyOn(acreSubgraph, "getDepositsByOwner")
      .mockResolvedValueOnce([finalizedDeposit.subgraph])

    const expectedDeposits = [
      {
        id: queuedDeposit.depositKey,
        txHash: queuedDeposit.txHash,
        amount: 105000n,
        status: DepositStatus.Queued,
      },
      {
        id: finalizedDeposit.subgraph.depositKey,
        txHash: finalizedDeposit.subgraph.txHash,
        amount: 104000n,
        status: DepositStatus.Finalized,
      },
    ]

    let result: Awaited<ReturnType<StakingModule["getDeposits"]>>

    beforeAll(async () => {
      tbtc.getDepositsByOwner = jest
        .fn()
        .mockResolvedValue([queuedDeposit, finalizedDeposit.tbtc])

      result = await staking.getDeposits()
    })

    it("should get the bitcoin address from bitcoin provider", () => {
      expect(bitcoinProvider.getAddress).toHaveBeenCalled()
    })

    it("should get Ethereum depositor owner address", () => {
      expect(orangeKit.predictAddress).toHaveBeenCalledWith(
        bitcoinDepositorAddress,
      )
    })

    it("should get deposits from subgraph", () => {
      expect(spyOnSubgraphGetDeposits).toHaveBeenCalledWith(
        predictedEthereumDepositorAddress,
      )
    })

    it("should get deposits from tbtc module", () => {
      expect(tbtc.getDepositsByOwner).toHaveBeenCalledWith(
        predictedEthereumDepositorAddress,
      )
    })

    it("should return correct data", () => {
      expect(result).toStrictEqual(expectedDeposits)
    })
  })
})

import TBTCModule, {
  BitcoinRawTx,
  BitcoinRawTxVectors,
  BitcoinTxHash,
  BitcoinUtxo,
  DepositReceipt,
  EthereumAddress,
} from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import { AcreContracts } from "../../src/lib/contracts"
import { StakingModule } from "../../src/modules/staking"
import { Hex } from "../../src/lib/utils"
import { MockAcreContracts } from "../utils/mock-acre-contracts"
import { MockMessageSigner } from "../utils/mock-message-signer"
import { MockTBTC } from "../utils/mock-tbtc"
import { StakeInitialization } from "../../src/modules/staking/stake-initialization"

jest.mock("@keep-network/tbtc-v2.ts", () => ({
  extractBitcoinRawTxVectors: jest.fn(),
  ...jest.requireActual("@keep-network/tbtc-v2.ts"),
}))

const stakingModuleData: {
  initializeStake: {
    receiver: EthereumAddress
    referral: number
    bitcoinRecoveryAddress: string
    mockedDepositBTCAddress: string
  }
} = {
  initializeStake: {
    receiver: EthereumAddress.from(ethers.Wallet.createRandom().address),
    referral: 1,
    bitcoinRecoveryAddress: "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc",
    mockedDepositBTCAddress:
      "tb1qma629cu92skg0t86lftyaf9uflzwhp7jk63h6mpmv3ezh6puvdhs6w2r05",
  },
}

const stakingInitializationData: {
  fundingUtxos: Array<Omit<BitcoinUtxo, "value"> & { value: bigint }>
  bitcoinRawTx: BitcoinRawTx
  bitcoinRawTxVectors: BitcoinRawTxVectors
  depositReceipt: Omit<DepositReceipt, "depositor">
  mockedInitializeTxHash: Hex
} = {
  fundingUtxos: [
    {
      transactionHash: BitcoinTxHash.from(
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ),
      outputIndex: 1,
      value: 2222n,
    },
    {
      transactionHash: BitcoinTxHash.from(
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      ),
      outputIndex: 0,
      value: 1111n,
    },
  ],
  bitcoinRawTx: { transactionHex: "" },
  bitcoinRawTxVectors: {
    version: Hex.from("111111"),
    inputs: Hex.from("222222"),
    outputs: Hex.from("333333"),
    locktime: Hex.from("444444"),
  },
  depositReceipt: {
    blindingFactor: Hex.from("555555"),
    walletPublicKeyHash: Hex.from("666666"),
    refundPublicKeyHash: Hex.from("777777"),
    refundLocktime: Hex.from("888888"),
  },
  mockedInitializeTxHash: Hex.from("999999"),
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
      receiver,
      referral,
    } = stakingModuleData.initializeStake
    const mockedDeposit = {
      getBitcoinAddress: jest.fn().mockResolvedValue(mockedDepositBTCAddress),
      detectFunding: jest.fn(),
      getReceipt: jest.fn(),
    }
    const mockedSignedMessage = { verify: jest.fn() }
    let result: StakeInitialization

    beforeEach(async () => {
      tbtc.deposits.initiateDeposit = jest.fn().mockReturnValue(mockedDeposit)
      messageSigner.sign = jest.fn().mockResolvedValue(mockedSignedMessage)

      result = await staking.initializeStake(
        bitcoinRecoveryAddress,
        receiver,
        referral,
      )
    })

    it("should initiate tBTC deposit", () => {
      expect(tbtc.deposits.initiateDeposit).toHaveBeenCalledWith(
        bitcoinRecoveryAddress,
      )
    })

    it("should return stake initialization object", async () => {
      expect(result).toBeInstanceOf(StakeInitialization)
      expect(result.getBitcoinAddress).toBeDefined()
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
          expect(await result.getBitcoinAddress()).toBe(mockedDepositBTCAddress)
        })
      })

      describe("signMessage", () => {
        describe("when signing by valid receiver", () => {
          const depositorAddress = ethers.Wallet.createRandom().address

          beforeEach(async () => {
            mockedSignedMessage.verify.mockReturnValue(receiver)
            contracts.depositor.getChainIdentifier = jest
              .fn()
              .mockReturnValue(EthereumAddress.from(depositorAddress))

            await result.signMessage()
          })

          it("should sign message", () => {
            expect(messageSigner.sign).toHaveBeenCalledWith(
              {
                name: "TBTCDepositor",
                version: "1",
                chainId: 1,
                verifyingContract: contracts.depositor.getChainIdentifier(),
              },
              {
                Stake: [
                  { name: "receiver", type: "address" },
                  { name: "bitcoinRecoveryAddress", type: "string" },
                ],
              },
              {
                receiver: receiver.identifierHex,
                bitcoinRecoveryAddress:
                  depositReceipt.refundPublicKeyHash.toPrefixedString(),
              },
            )
          })

          it("should verify signed message", () => {
            expect(mockedSignedMessage.verify).toHaveBeenCalled()
          })
        })

        describe("when signing by invalid receiver", () => {
          const invalidReceiver = EthereumAddress.from(
            ethers.Wallet.createRandom().address,
          )

          beforeEach(async () => {
            mockedSignedMessage.verify = jest
              .fn()
              .mockResolvedValue(invalidReceiver)
          })

          it("should throw an error", () => {
            expect(async () => {
              await result.signMessage()
            }).rejects.toThrow("Invalid receiver address")
          })
        })
      })

      describe("stake", () => {
        beforeAll(() => {
          mockedSignedMessage.verify.mockReturnValue(receiver)
        })

        describe("when the message has not been signed yet", () => {
          it("should throw an error", () => {
            expect(async () => {
              await result.stake()
            }).rejects.toThrow("Sign message first")
          })
        })

        describe("when message has already been signed", () => {
          beforeEach(async () => {
            await result.signMessage()
          })

          describe("when bitcoin deposit address doesn't have utxos yet", () => {
            beforeEach(() => {
              mockedDeposit.detectFunding.mockResolvedValue([])
            })

            it("should throw an error", () => {
              expect(async () => {
                await result.stake()
              }).rejects.toThrow("Deposit not found yet")
            })
          })

          describe("when bitcoin deposit address has utxos", () => {
            const {
              fundingUtxos,
              bitcoinRawTx,
              bitcoinRawTxVectors,
              mockedInitializeTxHash: mockedTxHash,
            } = stakingInitializationData
            let spyOnExtractBitcoinRawTxVectors: jest.SpyInstance<TBTCModule.BitcoinRawTxVectors>
            let tx: Hex

            beforeAll(async () => {
              mockedDeposit.detectFunding.mockResolvedValue(fundingUtxos)
              spyOnExtractBitcoinRawTxVectors = jest
                .spyOn(TBTCModule, "extractBitcoinRawTxVectors")
                .mockReturnValue(bitcoinRawTxVectors)

              tbtc.bitcoinClient.getRawTransaction = jest
                .fn()
                .mockResolvedValue(bitcoinRawTx)

              contracts.depositor.initializeStake = jest
                .fn()
                .mockResolvedValue(mockedTxHash)

              tx = await result.stake()
            })

            it("should look for deposits", () => {
              expect(mockedDeposit.detectFunding).toHaveBeenCalled()
            })

            it("should get raw transaction for the most recent utxo", () => {
              const txHash = fundingUtxos[0].transactionHash

              expect(tbtc.bitcoinClient.getRawTransaction).toHaveBeenCalledWith(
                txHash,
              )
            })

            it("should extract bitcoin raw tx vectors", () => {
              expect(spyOnExtractBitcoinRawTxVectors).toHaveBeenCalledWith(
                bitcoinRawTx,
              )
            })

            it("should get deposit receipt", () => {
              expect(mockedDeposit.getReceipt).toHaveBeenCalled()
            })

            it("should initialize stake in tBTC depositor contract", () => {
              const { outputIndex } = fundingUtxos[0]

              const revealInfo = {
                fundingOutputIndex: outputIndex,
                blindingFactor: depositReceipt.blindingFactor,
                walletPublicKeyHash: depositReceipt.walletPublicKeyHash,
                refundPublicKeyHash: depositReceipt.refundPublicKeyHash,
                refundLocktime: depositReceipt.refundLocktime,
              }

              expect(contracts.depositor.initializeStake).toHaveBeenCalledWith(
                bitcoinRawTxVectors,
                revealInfo,
                receiver,
                referral,
              )
            })

            it("should return transaction hash", () => {
              expect(tx).toBe(mockedTxHash)
            })
          })
        })
      })
    })
  })
})

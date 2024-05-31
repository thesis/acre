import {
  EthereumAddress,
  EthereumNetwork,
  TBTC as TbtcSdk,
  Deposit as TbtcSdkDeposit,
} from "@keep-network/tbtc-v2.ts"

import { ZeroAddress, Provider, ethers } from "ethers"
import {
  IEthereumSignerCompatibleWithEthersV5,
  VoidSigner,
  Hex,
} from "../../../src"
import Deposit from "../../../src/modules/tbtc/Deposit"
import TbtcApi from "../../../src/lib/api/TbtcApi"

import Tbtc from "../../../src/modules/tbtc"
import {
  depositTestData,
  receiptTestData,
  revealTestData,
  tbtcApiDeposits,
} from "../../data/deposit"
import { MockAcreContracts } from "../../utils/mock-acre-contracts"

import { MockTbtcSdk } from "../../utils/mock-tbtc-sdk"
import { getChainIdByNetwork } from "../../../src/lib/ethereum/network"

jest.mock("@keep-network/tbtc-v2.ts", (): object => ({
  TbtcSdk: jest.fn(),
  ...jest.requireActual("@keep-network/tbtc-v2.ts"),
}))

class MockEthereumSignerCompatibleWithEthersV5 extends VoidSigner {
  constructor() {
    super(ZeroAddress, {} as Provider)
  }

  getAddress = jest.fn()

  connect = jest.fn()

  signTransaction = jest.fn()

  signMessage = jest.fn()

  signTypedData = jest.fn()

  _isSigner: boolean = true

  _checkProvider = jest.fn()

  getChainId = jest.fn().mockResolvedValue(getChainIdByNetwork("sepolia"))
}

describe("Tbtc", () => {
  const tbtcApiUrl = "https://api.acre.fi/v1/deposit/"

  const tbtcSdk: TbtcSdk = new MockTbtcSdk()

  const { bitcoinDepositor } = new MockAcreContracts()
  const tbtcApi: TbtcApi = new TbtcApi(tbtcApiUrl)

  const tbtc = new Tbtc(tbtcApi, tbtcSdk, bitcoinDepositor)

  describe("initialize", () => {
    const mockedSigner: IEthereumSignerCompatibleWithEthersV5 =
      new MockEthereumSignerCompatibleWithEthersV5()

    describe("when network is mainnet", () => {
      const network: EthereumNetwork = "mainnet"

      let result: Tbtc

      beforeAll(async () => {
        jest.spyOn(TbtcSdk, "initializeMainnet").mockResolvedValueOnce(tbtcSdk)

        result = await Tbtc.initialize(
          mockedSigner,
          network,
          tbtcApiUrl,
          bitcoinDepositor,
        )
      })

      it("should initialize TbtcSdk for mainnet", () => {
        expect(TbtcSdk.initializeMainnet).toHaveBeenCalledWith(mockedSigner)
      })

      it("should return initialized Tbtc module", () => {
        expect(result).toBeInstanceOf(Tbtc)
      })
    })

    describe("when network is sepolia", () => {
      const network: EthereumNetwork = "sepolia"

      let result: Tbtc

      beforeAll(async () => {
        jest.spyOn(TbtcSdk, "initializeSepolia").mockResolvedValueOnce(tbtcSdk)

        result = await Tbtc.initialize(
          mockedSigner,
          network,
          tbtcApiUrl,
          bitcoinDepositor,
        )
      })

      it("should initialize TbtcSdk for sepolia", () => {
        expect(TbtcSdk.initializeSepolia).toHaveBeenCalledWith(mockedSigner)
      })

      it("should return initialized Tbtc module", () => {
        expect(result).toBeInstanceOf(Tbtc)
      })
    })
  })

  describe("initiateDeposit", () => {
    describe("when Bitcoin address is empty", () => {
      it("should throw an error", async () => {
        const emptyBitcoinRecoveryAddress = ""

        await expect(
          tbtc.initiateDeposit(
            depositTestData.depositOwner,
            emptyBitcoinRecoveryAddress,
            depositTestData.referral,
          ),
        ).rejects.toThrow("Ethereum or Bitcoin address is not available")
      })
    })

    describe("when Bitcoin address is provided", () => {
      beforeAll(() => {
        bitcoinDepositor.encodeExtraData = jest
          .fn()
          .mockReturnValue(depositTestData.extraData)

        const tbtcSdkDeposit: TbtcSdkDeposit =
          jest.fn() as unknown as TbtcSdkDeposit

        tbtcSdkDeposit.getReceipt = jest.fn().mockReturnValue(receiptTestData)

        tbtcSdk.deposits.initiateDepositWithProxy = jest
          .fn()
          .mockReturnValue(tbtcSdkDeposit)
      })

      describe("when saveReveal succeeded", () => {
        let result: Deposit

        beforeAll(async () => {
          jest.spyOn(tbtcApi, "saveReveal").mockResolvedValueOnce(true)

          result = await tbtc.initiateDeposit(
            depositTestData.depositOwner,
            depositTestData.bitcoinRecoveryAddress,
            depositTestData.referral,
          )
        })

        it("should call saveReveal", () => {
          expect(tbtcApi.saveReveal).toHaveBeenCalledWith(revealTestData)
        })

        it("should initiate a deposit", () => {
          expect(result).toBeInstanceOf(Deposit)
        })
      })

      describe("when saveReveal failed", () => {
        beforeAll(() => {
          jest.spyOn(tbtcApi, "saveReveal").mockResolvedValueOnce(false)
        })

        it("should throw an error", async () => {
          await expect(
            tbtc.initiateDeposit(
              depositTestData.depositOwner,
              depositTestData.bitcoinRecoveryAddress,
              depositTestData.referral,
            ),
          ).rejects.toThrow("Reveal not saved properly in the database")
        })
      })
    })
  })

  describe("getDepositsByOwner", () => {
    const depositOwner = EthereumAddress.from(
      ethers.Wallet.createRandom().address,
    )
    const spyOnSolidityPackedKeccak256 = jest.spyOn(
      ethers,
      "solidityPackedKeccak256",
    )

    let result: Awaited<ReturnType<Tbtc["getDepositsByOwner"]>>

    beforeAll(async () => {
      jest
        .spyOn(tbtcApi, "getDepositsByOwner")
        .mockResolvedValueOnce(tbtcApiDeposits)

      result = await tbtc.getDepositsByOwner(depositOwner)
    })

    it("should get deposits from tbtc api", () => {
      expect(tbtcApi.getDepositsByOwner).toHaveBeenCalledWith(depositOwner)
    })

    it("should add a deposit key to each deposit", () => {
      const deposit1 = tbtcApiDeposits[0]
      const deposit2 = tbtcApiDeposits[1]

      expect(spyOnSolidityPackedKeccak256).toHaveBeenCalledTimes(2)
      expect(spyOnSolidityPackedKeccak256).toHaveBeenNthCalledWith(
        1,
        ["bytes32", "uint32"],
        [
          Hex.from(deposit1.txHash).reverse().toPrefixedString(),
          deposit1.outputIndex,
        ],
      )
      expect(spyOnSolidityPackedKeccak256).toHaveBeenNthCalledWith(
        2,
        ["bytes32", "uint32"],
        [
          Hex.from(deposit2.txHash).reverse().toPrefixedString(),
          deposit2.outputIndex,
        ],
      )
    })

    it("should return correct data", () => {
      const deposit1 = tbtcApiDeposits[0]
      const deposit2 = tbtcApiDeposits[1]

      expect(result).toStrictEqual([
        {
          status: deposit1.status,
          initialAmount: BigInt(deposit1.initialAmount),
          depositKey:
            "0x9d7edf34dd3a687437ec637f7495cde408846d1308b5ca0ade907b06c07f0be7",
          txHash: deposit1.txHash,
          timestamp: deposit1.createdAt,
        },
        {
          status: deposit2.status,
          initialAmount: BigInt(deposit2.initialAmount),
          depositKey:
            "0xcc465e44028f920712f67e48da2e2f6d1e28dacfa7d1e4c7c73cfec250c499d6",
          txHash: deposit2.txHash,
          timestamp: deposit2.createdAt,
        },
      ])
    })
  })
})

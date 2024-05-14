import {
  EthereumNetwork,
  TBTC as TbtcSdk,
  Deposit as TbtcSdkDeposit,
} from "@keep-network/tbtc-v2.ts"

import { IEthereumSignerCompatibleWithEthersV5 } from "../../../src"
import Deposit from "../../../src/modules/tbtc/Deposit"
import TbtcApi from "../../../src/lib/api/TbtcApi"

import Tbtc from "../../../src/modules/tbtc"
import {
  depositTestData,
  receiptTestData,
  revealTestData,
} from "../../data/deposit"
import { MockAcreContracts } from "../../utils/mock-acre-contracts"

import { MockTbtcSdk } from "../../utils/mock-tbtc-sdk"
import { getChainIdByNetwork } from "../../../src/lib/ethereum/network"

jest.mock("@keep-network/tbtc-v2.ts", (): object => ({
  TbtcSdk: jest.fn(),
  ...jest.requireActual("@keep-network/tbtc-v2.ts"),
}))

class MockEthereumSignerCompatibleWithEthersV5
  implements IEthereumSignerCompatibleWithEthersV5
{
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
    const tbtcApi: TbtcApi = new TbtcApi(tbtcApiUrl)

    let tbtc: Tbtc

    beforeAll(() => {
      tbtc = new Tbtc(tbtcApi, tbtcSdk, bitcoinDepositor)
    })

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
})

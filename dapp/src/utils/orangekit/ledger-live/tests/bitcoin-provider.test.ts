/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BitcoinNetwork } from "@acre-btc/sdk"
import { beforeAll, vi, expect, describe, it, afterAll } from "vitest"
import {
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { Balance } from "@orangekit/react/dist/src/wallet/bitcoin-wallet-provider"
import AcreLedgerLiveBitcoinProvider from "../bitcoin-provider"

describe("AcreLedgerLiveBitcoinProvider", () => {
  const bitcoinAddress = "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc"
  const mockedAccount = {
    id: "test",
    address: bitcoinAddress,
    balance: 100,
    spendableBalance: 80,
  }
  const hwAppId = "Acre"
  const mockedWalletApiClient = {
    custom: {
      acre: {
        transactionSignAndBroadcast: vi.fn(),
        messageSign: vi.fn(),
      },
    },
    account: {
      list: vi.fn(),
      request: vi.fn(),
    },
    bitcoin: {
      getAddress: vi.fn(),
      getPublicKey: vi.fn(),
    },
  }

  const mockedTransport = {
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  const provider: AcreLedgerLiveBitcoinProvider =
    new AcreLedgerLiveBitcoinProvider(
      BitcoinNetwork.Testnet,
      mockedTransport as unknown as WindowMessageTransport,
      mockedWalletApiClient as unknown as WalletAPIClient,
    )

  describe("sendBitcoin", () => {
    describe("when not connected", () => {
      it("should throw an error", async () => {
        await expect(() =>
          provider.sendBitcoin(bitcoinAddress, 1),
        ).rejects.toThrowError("Connect first")
      })
    })

    describe("when connected", () => {
      const mockedTxHash = "123"
      const satoshis = 1
      let result: string

      beforeAll(async () => {
        mockedWalletApiClient.account.list.mockResolvedValueOnce([
          mockedAccount,
        ])
        mockedWalletApiClient.custom.acre.transactionSignAndBroadcast.mockResolvedValue(
          mockedTxHash,
        )

        await provider.connect()

        result = await provider.sendBitcoin(bitcoinAddress, satoshis)
      })

      afterAll(() => {
        vi.resetAllMocks()
      })

      it("should send transaction via Acre custom module", () => {
        expect(
          mockedWalletApiClient.custom.acre.transactionSignAndBroadcast,
        ).toHaveBeenCalledWith(
          mockedAccount.id,
          {
            family: "bitcoin",
            amount: satoshis.toString(),
            recipient: bitcoinAddress,
          },
          { hwAppId },
        )
      })

      it("should return transaction hash", () => {
        expect(result).toBe(mockedTxHash)
      })
    })
  })

  describe("getBalance", () => {
    let result: Balance

    beforeAll(async () => {
      mockedWalletApiClient.account.list.mockResolvedValue([mockedAccount])

      await provider.connect()

      result = await provider.getBalance()
    })

    it("should list accounts", () => {
      // The first call was in `connect` function - this is a second call.
      expect(mockedWalletApiClient.account.list).toHaveBeenNthCalledWith(2, {
        currencyIds: "bitcoin_testnet",
      })
    })

    it("should return correct balance", () => {
      expect(result).toBe({
        total: mockedAccount.balance.toString(),
        confirmed: mockedAccount.spendableBalance.toString(),
        unconfirmed: (
          mockedAccount.balance - mockedAccount.spendableBalance
        ).toString(),
      })
    })
  })
})

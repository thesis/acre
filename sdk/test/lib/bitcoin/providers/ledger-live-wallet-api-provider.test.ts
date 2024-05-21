import ledgerLib, {
  Account,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import xpubLib, { Purpose } from "@swan-bitcoin/xpub-lib"
import { BitcoinAddressHelper } from "@orangekit/sdk"
import { LedgerLiveWalletApiBitcoinProvider } from "../../../../src"

jest.mock("@ledgerhq/wallet-api-client", () => ({
  WalletAPIClient: jest.fn(),
  WindowMessageTransport: jest.fn(),
}))

jest.mock("@orangekit/sdk", () => ({
  BitcoinAddressHelper: {
    isP2PKHAddress: jest
      .fn()
      .mockImplementation(
        (address: string) =>
          address.startsWith("1") ||
          address.startsWith("m") ||
          address.startsWith("n"),
      ),
    isP2WPKHAddress: jest
      .fn()
      .mockImplementation(
        (address: string) =>
          (address.startsWith("tb1") || address.startsWith("bc1")) &&
          address.length !== 62,
      ),
  },
}))

jest.mock("@swan-bitcoin/xpub-lib", (): object => ({
  addressFromExtPubKey: jest.fn(),
  ...jest.requireActual("@swan-bitcoin/xpub-lib"),
}))

describe("Ledger Live Wallet API Bitcoin provider", () => {
  const mockTransport = { connect: jest.fn() }
  const mockWalletApiClient = {
    account: {
      list: jest.fn(),
    },
    bitcoin: {
      getXPub: jest.fn(),
    },
  }

  describe("init", () => {
    const accountId = "123"

    beforeAll(() => {
      mockWalletApiClient.account.list.mockReturnValue([{ id: accountId }])

      jest
        .spyOn(ledgerLib, "WalletAPIClient")
        // @ts-expect-error we only mock the functions we use in the code.
        .mockReturnValue(mockWalletApiClient)

      jest
        .spyOn(ledgerLib, "WindowMessageTransport")
        // @ts-expect-error we only mock the functions we use in the code.
        .mockReturnValue(mockTransport)
    })

    describe("when account exists", () => {
      describe.each<{ network: "mainnet" | "testnet"; currencyIds: string[] }>([
        { network: "mainnet", currencyIds: ["bitcoin"] },
        { network: "testnet", currencyIds: ["bitcoin_testnet"] },
      ])("when the network is $network", ({ network, currencyIds }) => {
        let result: LedgerLiveWalletApiBitcoinProvider

        beforeAll(async () => {
          result = await LedgerLiveWalletApiBitcoinProvider.init(
            accountId,
            network,
          )
        })

        it("should connect with message transport", () => {
          expect(WindowMessageTransport).toHaveBeenCalled()
          expect(mockTransport.connect).toHaveBeenCalled()
        })

        it("should create the wallet api object", () => {
          expect(WalletAPIClient).toHaveBeenCalledWith(mockTransport)
        })

        it("should check if the given account exists in wallet", () => {
          expect(mockWalletApiClient.account.list).toHaveBeenCalledWith({
            currencyIds,
          })
        })

        it("should initialize the provider correctly", () => {
          expect(result).toBeDefined()
          expect(result.getAddress).toBeDefined()
        })
      })
    })

    describe("when the account does not exist", () => {
      it("should throw an error", async () => {
        await expect(LedgerLiveWalletApiBitcoinProvider.init).rejects.toThrow(
          "Account not found",
        )
      })
    })
  })

  describe("getAddress", () => {
    describe.each<{
      xpub: string
      addressType: "P2PKH" | "P2WPKH"
      // The "renewed" address used to receive funds.
      freshAddress: string
      expectedPurpose: Purpose
      expectedAddress: string
    }>([
      {
        xpub: "tpubDDJ2EkVNzDKvfq4pX7rHuJLzQE2m3xqewzkRhWQE1TEnjRUERdn3tvEkDHPc5bfjZWt9pPY3T6R7jeM1BugLdJZVkqTaAhRJ7C5nCpidvgY",
        addressType: "P2PKH",
        expectedPurpose: Purpose.P2PKH,
        expectedAddress: "mnuQubqM5W4FRXvnfc2LB4Vw1dQLVNB8sa",
        freshAddress: "n25cBRVKcAvdTK3Ho88LbT9bsQti5mR4ay",
      },
      {
        xpub: "tpubDDaFptfbeW9PaJvCwjcqt8GNwFe19a4ZQ6N8KRJV7tXz7pkaXxCnpswBDBooAe3dwGj4TwecmrFfsbC8dwJmTZAihJ2ci8mxSnH4jr9NknA",
        addressType: "P2WPKH",
        expectedPurpose: Purpose.P2WPKH,
        expectedAddress: "tb1q3erffggwvqlcnt0yh8say9xnm6ya0jdvtw98f2",
        freshAddress: "tb1qf3t77hmw4f0zl407r7jk7ykaphdzk4m6a2xvml",
      },
    ])(
      "when it is $addressType address type",
      ({
        xpub,
        expectedAddress,
        expectedPurpose,
        freshAddress,
        addressType,
      }) => {
        const network = "testnet"
        const spyOnAddressFromExtPubKey = jest.spyOn(
          xpubLib,
          "addressFromExtPubKey",
        )
        let account: Account
        let provider: LedgerLiveWalletApiBitcoinProvider

        let result: string

        beforeEach(async () => {
          account = { id: "123", address: freshAddress } as Account
          mockWalletApiClient.account.list.mockResolvedValue([account])
          mockWalletApiClient.bitcoin.getXPub.mockResolvedValue(xpub)

          provider = await LedgerLiveWalletApiBitcoinProvider.init(
            account.id,
            network,
          )

          jest
            .spyOn(ledgerLib, "WalletAPIClient")
            // @ts-expect-error we only mock the functions we use in the code.
            .mockReturnValue(mockWalletApiClient)

          jest
            .spyOn(ledgerLib, "WindowMessageTransport")
            // @ts-expect-error we only mock the functions we use in the code.
            .mockReturnValue(mockTransport)

          result = await provider.getAddress()
        })

        it("should check if it is supported address type", () => {
          expect(BitcoinAddressHelper.isP2PKHAddress).toHaveBeenCalledWith(
            account.address,
          )

          if (addressType !== "P2PKH") {
            expect(BitcoinAddressHelper.isP2WPKHAddress).toHaveBeenCalledWith(
              account.address,
            )
          }
        })

        it("should get the xpub for a given account", () => {
          expect(mockWalletApiClient.bitcoin.getXPub).toHaveBeenCalledWith(
            account.id,
          )
        })

        it("should get the address from extended public key", () => {
          expect(spyOnAddressFromExtPubKey).toHaveBeenCalledWith({
            extPubKey: xpub,
            change: 0,
            keyIndex: 0,
            purpose: expectedPurpose,
            network,
          })

          expect(result).toBe(expectedAddress)
        })
      },
    )

    describe("when it is unsupported address type", () => {
      let provider: LedgerLiveWalletApiBitcoinProvider

      beforeEach(async () => {
        const account = {
          id: "123",
          address:
            "tb1p00vwwtpuucdengeyyzsrcvf70e8ln98e5c8m3kf3cz9nzldvq3qqrl7kqn",
        } as Account
        const network = "testnet"
        const xpub =
          "tpubDDDTd2KnT6BEcagK3ib46tYfh8FCZ7aXxkuj84j9GQnuiyMfsXw5CJ5NiRov8pf81DeSpcwTXeoNsYYxwYEdRdriKZrCeXF7JQrgbTp71PM"

        mockWalletApiClient.account.list.mockResolvedValue([account])
        mockWalletApiClient.bitcoin.getXPub.mockResolvedValue(xpub)

        provider = await LedgerLiveWalletApiBitcoinProvider.init(
          account.id,
          network,
        )

        jest
          .spyOn(ledgerLib, "WalletAPIClient")
          // @ts-expect-error we only mock the functions we use in the code.
          .mockReturnValue(mockWalletApiClient)

        jest
          .spyOn(ledgerLib, "WindowMessageTransport")
          // @ts-expect-error we only mock the functions we use in the code.
          .mockReturnValue(mockTransport)
      })

      it("should throw an error", async () => {
        await expect(provider.getAddress()).rejects.toThrow(
          "Unsupported Bitcoin address type",
        )
      })
    })
  })
})

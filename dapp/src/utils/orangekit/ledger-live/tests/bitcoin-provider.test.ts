import { BitcoinNetwork } from "@acre-btc/sdk"
import { beforeAll, vi, expect, describe, it } from "vitest"
import {
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { Balance } from "@orangekit/react/dist/src/wallet/bitcoin-wallet-provider"
import { AcreMessageType } from "@ledgerhq/wallet-api-acre-module"
import { ZeroAddress } from "ethers"
import BigNumber from "bignumber.js"
import AcreLedgerLiveBitcoinProvider from "../bitcoin-provider"

describe("AcreLedgerLiveBitcoinProvider", () => {
  const bitcoinAddress = "mjc2zGWypwpNyDi4ZxGbBNnUA84bfgiwYc"
  const zeroAddress = "mhyJ3Rq9Sn1Hopu43upGxaxrV1ANZh4QEh"
  const mockedAccount = {
    id: "test",
    address: bitcoinAddress,
    zeroAddress,
    balance: 100,
    spendableBalance: 80,
  }
  const hwAppId = "Acre"

  const withdrawalData = {
    to: "0x0",
    value: "100",
    data: "0x1",
    safeTxGas: "0x0",
    baseGas: "0x0",
    gasPrice: "0x0",
    gasToken: ZeroAddress,
    refundReceiver: ZeroAddress,
    operation: 1,
    nonce: 1,
  }

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

  let provider: AcreLedgerLiveBitcoinProvider

  describe("when connected", () => {
    beforeAll(async () => {
      provider = new AcreLedgerLiveBitcoinProvider(
        BitcoinNetwork.Testnet,
        mockedTransport as unknown as WindowMessageTransport,
        mockedWalletApiClient as unknown as WalletAPIClient,
      )
      mockedWalletApiClient.account.list.mockResolvedValue([mockedAccount])
      mockedWalletApiClient.bitcoin.getAddress.mockReturnValue(zeroAddress)

      await provider.connect()
    })

    describe("sendBitcoin", () => {
      describe("when connected", () => {
        const mockedTxHash = "123"
        const satoshis = 1
        let result: string

        beforeAll(async () => {
          mockedWalletApiClient.custom.acre.transactionSignAndBroadcast.mockResolvedValue(
            mockedTxHash,
          )

          result = await provider.sendBitcoin(bitcoinAddress, satoshis)
        })

        it("should send transaction via Acre custom module", () => {
          expect(
            mockedWalletApiClient.custom.acre.transactionSignAndBroadcast,
          ).toHaveBeenCalledWith(
            mockedAccount.id,
            {
              family: "bitcoin",
              amount: new BigNumber(satoshis),
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
        result = await provider.getBalance()
      })

      it("should list accounts", () => {
        // The first call was in `connect` function - this is a second call.
        expect(mockedWalletApiClient.account.list).toHaveBeenNthCalledWith(2, {
          currencyIds: ["bitcoin_testnet"],
        })
      })

      it("should return correct balance", () => {
        expect(result).toStrictEqual({
          total: mockedAccount.balance.toString(),
          confirmed: mockedAccount.spendableBalance.toString(),
          unconfirmed: (
            mockedAccount.balance - mockedAccount.spendableBalance
          ).toString(),
        })
      })
    })

    describe("getAddress", () => {
      let result: string

      beforeAll(async () => {
        result = await provider.getAddress()
      })

      it("should get the address from bitcoin module", () => {
        expect(mockedWalletApiClient.bitcoin.getAddress).toHaveBeenCalledWith(
          mockedAccount.id,
          "0/0",
        )
      })

      it("should return correct address", () => {
        expect(result).toBe(zeroAddress)
      })
    })

    describe("signMessage", () => {
      const taprootAddress =
        "tb1pzfxzc0n399ezjrxkd0xyf2xuymz8a0rdzlka6ynmtatqv64z5ausw5suv2"
      const mockedPublicKey =
        "033b37d8b5dda991cdeb628c28c7958cf9d7bc61dfde29357b8a7190b9b3295423"
      const signInMessage = "test"

      const messageTypesData = [
        {
          type: AcreMessageType.Withdraw,
          methodName: "signWithdrawMessage",
          args: ["", withdrawalData],
          messageData: {
            ...withdrawalData,
            operation: withdrawalData.operation.toString(),
            nonce: withdrawalData.nonce.toString(),
          },
        },
        {
          type: AcreMessageType.SignIn,
          methodName: "signMessage",
          args: [signInMessage],
          messageData: signInMessage,
        },
      ]

      const testData = [
        {
          addressType: "Nested Segwit (P2SH-P2WPKH)",
          address: "2N3dhPvUMaGaqrXGrHa8VnKVhfxy38A4YVW",
          signature: Buffer.from(
            "1f2d48374c17b5af8da605fbeb1540540f0e4e0a5108c26c13ac4ec3bd9eafa8011951b2160995b9a9da85502a6c3c689a556f542a0e7a57f7cd187670e7d9c4f9",
            "hex",
          ),
          expectedSignature:
            "0x232d48374c17b5af8da605fbeb1540540f0e4e0a5108c26c13ac4ec3bd9eafa8011951b2160995b9a9da85502a6c3c689a556f542a0e7a57f7cd187670e7d9c4f9",
          publicKey:
            "033b37d8b5dda991cdeb628c28c7958cf9d7bc61dfde29357b8a7190b9b3295423",
        },
        {
          addressType: "Legacy (P2PKH)",
          address: "mrXtbjt4XXcX2aruY1Lx58YF2F8LXYzi1U",
          signature: Buffer.from(
            "1fdea55216183919f35950e0bfe5b4889c6103c708d50fd2e0fe7eddc826b295a94a504475fb5f8896a87ac156590575a33390d8bde9ddb637aa096ae61546201f",
            "hex",
          ),
          expectedSignature:
            "0x1fdea55216183919f35950e0bfe5b4889c6103c708d50fd2e0fe7eddc826b295a94a504475fb5f8896a87ac156590575a33390d8bde9ddb637aa096ae61546201f",
        },
        {
          addressType: "Native Segwit (P2WPKH)",
          address: "tb1q3x5lk9l83aek9c0vu38tx69u2lyxsdy6tww2rp",
          signature: Buffer.from(
            "20ab1f9cc6955f17a18240014fae5303576ea9a7caacabebf26c2b296e7b7b75857b432a1e0b6499b8f4a82f34f02e293b884de1792c5d6cd761eefe4e9f1130c0",
            "hex",
          ),
          expectedSignature:
            "0x28ab1f9cc6955f17a18240014fae5303576ea9a7caacabebf26c2b296e7b7b75857b432a1e0b6499b8f4a82f34f02e293b884de1792c5d6cd761eefe4e9f1130c0",
        },
      ]

      describe.each(messageTypesData)(
        "$type",
        ({ methodName, args, type, messageData }) => {
          describe("with supported address type", () => {
            describe.each(testData)(
              "when sign with $addressType address",
              ({ address, signature, expectedSignature, publicKey }) => {
                let result: string

                beforeAll(async () => {
                  mockedWalletApiClient.custom.acre.messageSign.mockResolvedValue(
                    signature,
                  )
                  mockedWalletApiClient.account.request.mockResolvedValue({
                    ...mockedAccount,
                    address,
                  })
                  mockedWalletApiClient.bitcoin.getAddress.mockResolvedValue(
                    address,
                  )

                  if (publicKey) {
                    mockedWalletApiClient.bitcoin.getPublicKey.mockResolvedValue(
                      publicKey,
                    )
                  }

                  await provider.connect()

                  // @ts-expect-error test
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                  result = await provider[methodName](...args)
                })

                it("should call the acre custom module to sign message", () => {
                  expect(
                    mockedWalletApiClient.custom.acre.messageSign,
                  ).toHaveBeenCalledWith(
                    mockedAccount.id,
                    {
                      type,
                      message: messageData,
                    },
                    "0/0",
                    { hwAppId },
                  )
                })

                it("should return correct signature", () => {
                  expect(result).toBe(expectedSignature)
                })
              },
            )
          })

          describe("with unsupported address type", () => {
            beforeAll(async () => {
              mockedWalletApiClient.account.request.mockResolvedValue({
                ...mockedAccount,
                address: taprootAddress,
              })
              mockedWalletApiClient.bitcoin.getAddress.mockResolvedValue(
                taprootAddress,
              )
              mockedWalletApiClient.bitcoin.getPublicKey.mockResolvedValue(
                mockedPublicKey,
              )

              await provider.connect()
            })

            it("should throw an error", async () => {
              await expect(async () =>
                provider.signWithdrawMessage("", withdrawalData),
              ).rejects.toThrowError("Unsupported Bitcoin address type")
            })
          })
        },
      )
    })

    describe("getPublicKey", () => {
      const publicKey =
        "0x0301c3a0b3e1a18d0e04a455e2fbed97d97352cfc35ad272cdc8dcb0fc8dee6707"
      let result: string

      beforeAll(async () => {
        mockedWalletApiClient.bitcoin.getPublicKey.mockResolvedValueOnce(
          publicKey,
        )
        result = await provider.getPublicKey()
      })

      it("should get the public key from the bitcoin module", () => {
        expect(mockedWalletApiClient.bitcoin.getPublicKey).toHaveBeenCalledWith(
          mockedAccount.id,
          "0/0",
        )
      })

      it("should return correct public key", () => {
        expect(result).toBe(publicKey)
      })
    })

    describe("disconnect", () => {
      beforeAll(async () => {
        await provider.disconnect()
      })

      it("should close the connection", () => {
        expect(mockedTransport.disconnect).toHaveBeenCalled()
      })
    })
  })

  describe("when not connected", () => {
    beforeAll(() => {
      provider = new AcreLedgerLiveBitcoinProvider(
        BitcoinNetwork.Testnet,
        mockedTransport as unknown as WindowMessageTransport,
        mockedWalletApiClient as unknown as WalletAPIClient,
      )
    })

    describe.each([
      { methodName: "getPublicKey", args: [] },
      { methodName: "sendBitcoin", args: [] },
      { methodName: "signMessage", args: [] },
      { methodName: "signWithdrawMessage", args: ["", withdrawalData] },
      { methodName: "getAddress", args: [] },
      { methodName: "getBalance", args: [] },
    ])("$methodName", ({ methodName, args }) => {
      it("should throw an error", async () => {
        await expect(() =>
          // @ts-expect-error test
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          provider[methodName](...args),
        ).rejects.toThrowError("Connect first")
      })
    })
  })

  describe("connect", () => {
    const account2 = {
      ...mockedAccount,
      id: "2",
      address: "tb1q3x5lk9l83aek9c0vu38tx69u2lyxsdy6tww2rp",
      zeroAddress: "tb1qj502nrx8lv4azu4afuxhffma248gq8c00zl8uv",
    }

    const account3 = {
      ...mockedAccount,
      id: "3",
      address: "mrXtbjt4XXcX2aruY1Lx58YF2F8LXYzi1U",
      zeroAddress: "mhKLhBdi7JmtYNxRVTn3u5fSsXtiwDbj4K",
    }
    const accounts = [mockedAccount, account2, account3]

    let result: string

    describe("when not connected", () => {
      describe("when `tryConnectToAddress` is not set", () => {
        describe("when only one account is available", () => {
          beforeAll(async () => {
            mockedWalletApiClient.account.list.mockReturnValueOnce([
              mockedAccount,
            ])
            mockedWalletApiClient.bitcoin.getAddress.mockResolvedValueOnce(
              mockedAccount.zeroAddress,
            )

            provider = new AcreLedgerLiveBitcoinProvider(
              BitcoinNetwork.Testnet,
              mockedTransport as unknown as WindowMessageTransport,
              mockedWalletApiClient as unknown as WalletAPIClient,
            )

            result = await provider.connect()
          })

          it("should list accounts", () => {
            expect(mockedWalletApiClient.account.list).toHaveBeenCalledWith({
              currencyIds: ["bitcoin_testnet"],
            })
          })

          it("should get the bitcoin address from bitcoin module", () => {
            expect(
              mockedWalletApiClient.bitcoin.getAddress,
            ).toHaveBeenCalledWith(mockedAccount.id, "0/0")
          })

          it("should return the first account", () => {
            expect(result).toBe(mockedAccount.zeroAddress)
          })
        })

        describe("when there are more than one account to select", () => {
          beforeAll(async () => {
            mockedWalletApiClient.account.list.mockReturnValueOnce(accounts)
            mockedWalletApiClient.account.request.mockReturnValueOnce(account2)
            mockedWalletApiClient.bitcoin.getAddress.mockResolvedValueOnce(
              account2.zeroAddress,
            )

            provider = new AcreLedgerLiveBitcoinProvider(
              BitcoinNetwork.Testnet,
              mockedTransport as unknown as WindowMessageTransport,
              mockedWalletApiClient as unknown as WalletAPIClient,
            )

            result = await provider.connect()
          })

          it("should ask the user to select an account", () => {
            expect(mockedWalletApiClient.account.request).toHaveBeenCalledWith({
              currencyIds: ["bitcoin_testnet"],
            })
          })

          it("should get the bitcoin address from bitcoin module", () => {
            expect(
              mockedWalletApiClient.bitcoin.getAddress,
            ).toHaveBeenCalledWith(mockedAccount.id, "0/0")
          })

          it("should return account selected by the user", () => {
            expect(result).toBe(account2.zeroAddress)
          })
        })
      })

      describe("when `tryConnectToAddress` is set", () => {
        const tryConnectToAddress = account3.zeroAddress

        beforeAll(async () => {
          mockedWalletApiClient.bitcoin.getAddress.mockClear()

          mockedWalletApiClient.account.list.mockReturnValueOnce(accounts)
          mockedWalletApiClient.bitcoin.getAddress
            .mockReturnValueOnce(mockedAccount.zeroAddress)
            .mockReturnValueOnce(account2.zeroAddress)
            .mockReturnValueOnce(account3.zeroAddress)
            .mockResolvedValueOnce(tryConnectToAddress)

          provider = new AcreLedgerLiveBitcoinProvider(
            BitcoinNetwork.Testnet,
            mockedTransport as unknown as WindowMessageTransport,
            mockedWalletApiClient as unknown as WalletAPIClient,
            { tryConnectToAddress },
          )

          result = await provider.connect()
        })

        it("should list accounts", () => {
          expect(mockedWalletApiClient.account.list).toHaveBeenCalledWith({
            currencyIds: ["bitcoin_testnet"],
          })
        })

        it("should get zero address for all accounts", () => {
          expect(
            mockedWalletApiClient.bitcoin.getAddress,
          ).toHaveBeenNthCalledWith(1, mockedAccount.id, "0/0")
          expect(
            mockedWalletApiClient.bitcoin.getAddress,
          ).toHaveBeenNthCalledWith(2, account2.id, "0/0")
          expect(
            mockedWalletApiClient.bitcoin.getAddress,
          ).toHaveBeenNthCalledWith(3, account3.id, "0/0")
        })

        it("should get the bitcoin address from bitcoin module", () => {
          expect(mockedWalletApiClient.bitcoin.getAddress).toHaveBeenCalledWith(
            account3.id,
            "0/0",
          )
        })

        it("should return an account with the same address as `tryConnectToAddress` param", () => {
          expect(result).toBe(tryConnectToAddress)
        })
      })
    })

    describe("when the provider is already connected", () => {
      const selectedAccount = account2
      let secondConnectionResult: string

      beforeAll(async () => {
        mockedWalletApiClient.account.list.mockReturnValueOnce([mockedAccount])
        mockedWalletApiClient.account.request.mockReturnValueOnce(
          selectedAccount,
        )
        mockedWalletApiClient.bitcoin.getAddress
          .mockReturnValueOnce(mockedAccount.zeroAddress)
          .mockResolvedValueOnce(selectedAccount.zeroAddress)

        provider = new AcreLedgerLiveBitcoinProvider(
          BitcoinNetwork.Testnet,
          mockedTransport as unknown as WindowMessageTransport,
          mockedWalletApiClient as unknown as WalletAPIClient,
        )

        await provider.connect()

        secondConnectionResult = await provider.connect()
      })

      it("should ask the user to select an account", () => {
        expect(mockedWalletApiClient.account.request).toHaveBeenCalledWith({
          currencyIds: ["bitcoin_testnet"],
        })
      })

      it("should get the bitcoin address from bitcoin module", () => {
        expect(
          mockedWalletApiClient.bitcoin.getAddress,
          // The first connection was when the user connected for the first
          // time. Here we want to check the second call, after the user
          // selected the account for the second time.
        ).toHaveBeenNthCalledWith(2, selectedAccount.id, "0/0")
      })

      it("should return an account selected by the user", () => {
        expect(secondConnectionResult).toBe(selectedAccount.zeroAddress)
      })
    })
  })
})

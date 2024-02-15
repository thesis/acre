import {
  EthereumTransaction,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client"
import { TransactionRequest, ZeroAddress, JsonRpcProvider } from "ethers"
import { Hex } from "@acre-btc/sdk"

export const getLedgerWalletAPITransport = () => new WindowMessageTransport()

export const getLedgerLiveProvider = () =>
  new JsonRpcProvider(import.meta.env.VITE_ETH_HOSTNAME_HTTP)

// Created based on the
// https://github.com/keep-network/tbtc-v2/blob/main/typescript/src/lib/utils/ledger.ts.
export function serializeLedgerWalletApiEthereumTransaction(
  transaction: TransactionRequest,
): EthereumTransaction {
  const {
    value,
    to,
    nonce,
    data,
    gasPrice,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = transaction

  const ethereumTransaction: EthereumTransaction = {
    family: "ethereum" as const,
    // @ts-expect-error We do not want to install external bignumber.js lib so
    // here we use bigint. The Ledger Wallet Api just converts the bignumber.js
    // object to string so we can pass bigint. See:
    // https://github.com/LedgerHQ/wallet-api/blob/main/packages/core/src/families/ethereum/serializer.ts#L4
    amount: value ?? 0,
    recipient: to?.toString() || ZeroAddress,
    nonce: nonce ?? undefined,
    // @ts-expect-error See comment above.
    gasPrice: gasPrice ?? undefined,
    // @ts-expect-error See comment above.
    gasLimit: gasLimit ?? undefined,
    // @ts-expect-error See comment above.
    maxFeePerGas: maxFeePerGas ?? undefined,
    // @ts-expect-error See comment above.
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? undefined,
  }

  if (nonce) ethereumTransaction.nonce = Number(nonce)
  if (data)
    ethereumTransaction.data = Buffer.from(
      Hex.from(data.toString()).toString(),
      "hex",
    )

  return ethereumTransaction
}

import { Chain } from "#/types"
import {
  EthereumNetwork,
  BitcoinNetwork as AcreSDKBitcoinNetwork,
} from "@acre-btc/sdk"

export type BitcoinNetwork = Exclude<
  AcreSDKBitcoinNetwork,
  AcreSDKBitcoinNetwork.Unknown
>

const BLOCK_EXPLORER_TESTNET = {
  ethereum: { title: "Etherscan", url: "https://sepolia.etherscan.io" },
  bitcoin: { title: "Mempool Space", url: "https://mempool.space/testnet" },
}

const BLOCK_EXPLORER_MAINNET = {
  ethereum: { title: "Etherscan", url: "https://etherscan.io" },
  bitcoin: { title: "Mempool Space", url: "https://mempool.space" },
}

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> =
  import.meta.env.VITE_USE_TESTNET === "true"
    ? BLOCK_EXPLORER_TESTNET
    : BLOCK_EXPLORER_MAINNET

export const ETHEREUM_NETWORK: EthereumNetwork =
  import.meta.env.VITE_USE_TESTNET === "true" ? "sepolia" : "mainnet"

export const BITCOIN_NETWORK: BitcoinNetwork =
  import.meta.env.VITE_USE_TESTNET === "true"
    ? AcreSDKBitcoinNetwork.Testnet
    : AcreSDKBitcoinNetwork.Mainnet

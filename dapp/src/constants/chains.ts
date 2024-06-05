import { Chain } from "#/types"
import { BitcoinNetwork } from "@acre-btc/sdk"

const BLOCK_EXPLORER_TESTNET = {
  ethereum: { title: "Etherscan", url: "https://sepolia.etherscan.io" },
  bitcoin: { title: "Mempool", url: "https://mempool.space/testnet" },
}

const BLOCK_EXPLORER_MAINNET = {
  ethereum: { title: "Etherscan", url: "https://etherscan.io" },
  bitcoin: { title: "Mempool", url: "https://mempool.space" },
}

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> =
  import.meta.env.VITE_USE_TESTNET === "true"
    ? BLOCK_EXPLORER_TESTNET
    : BLOCK_EXPLORER_MAINNET

export const BITCOIN_NETWORK: BitcoinNetwork =
  import.meta.env.VITE_USE_TESTNET === "true"
    ? BitcoinNetwork.Testnet
    : BitcoinNetwork.Mainnet

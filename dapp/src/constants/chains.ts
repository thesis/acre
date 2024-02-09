import { Chain } from "#/types"
import { EthereumNetwork } from "@acre-btc/sdk"

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> = {
  ethereum: { title: "Etherscan", url: "https://etherscan.io" },
  bitcoin: { title: "Blockstream", url: "https://blockstream.info" },
}

export const ETHEREUM_NETWORK: EthereumNetwork =
  import.meta.env.VITE_USE_TESTNET === "true" ? "sepolia" : "mainnet"

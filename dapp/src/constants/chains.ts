import { Chain } from "#/types"
import { BitcoinNetwork } from "@acre-btc/sdk"
import env from "./env"

const BLOCK_EXPLORER_TESTNET = {
  bitcoin: { title: "Mempool", url: "https://mempool.space/testnet" },
}

const BLOCK_EXPLORER_MAINNET = {
  bitcoin: { title: "Mempool", url: "https://mempool.space" },
}

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> =
  env.USE_TESTNET ? BLOCK_EXPLORER_TESTNET : BLOCK_EXPLORER_MAINNET

export const BITCOIN_NETWORK: BitcoinNetwork = env.USE_TESTNET
  ? BitcoinNetwork.Testnet
  : BitcoinNetwork.Mainnet

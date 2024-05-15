import { Chain } from "#/types"
import {
  EthereumNetwork,
  BitcoinNetwork as AcreSDKBitcoinNetwork,
} from "@acre-btc/sdk"

export type BitcoinNetwork = Exclude<
  AcreSDKBitcoinNetwork,
  AcreSDKBitcoinNetwork.Unknown
>

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> = {
  ethereum: { title: "Etherscan", url: "https://etherscan.io" },
  bitcoin: { title: "Blockstream", url: "https://blockstream.info" },
}

export const ETHEREUM_NETWORK: EthereumNetwork =
  import.meta.env.VITE_USE_TESTNET === "true" ? "sepolia" : "mainnet"

export const BITCOIN_NETWORK: BitcoinNetwork =
  import.meta.env.VITE_USE_TESTNET === "true"
    ? AcreSDKBitcoinNetwork.Testnet
    : AcreSDKBitcoinNetwork.Mainnet

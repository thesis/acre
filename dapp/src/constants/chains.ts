import { Chain } from "#/types"

export const BLOCK_EXPLORER: Record<Chain, { title: string; url: string }> = {
  ethereum: { title: "Etherscan", url: "https://etherscan.io" },
  bitcoin: { title: "Blockstream", url: "https://blockstream.info" },
}

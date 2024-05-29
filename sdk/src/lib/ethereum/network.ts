export type EthereumNetwork = "mainnet" | "sepolia"

const NETWORK_TO_CHAIN_ID: Record<EthereumNetwork, bigint> = {
  mainnet: 1n,
  sepolia: 11155111n,
}

export function getChainIdByNetwork(network: EthereumNetwork) {
  return NETWORK_TO_CHAIN_ID[network]
}

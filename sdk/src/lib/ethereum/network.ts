export type EthereumNetwork = "mainnet" | "sepolia"

const NETWORK_TO_CHAIN_ID: Record<EthereumNetwork, number> = {
  mainnet: 1,
  sepolia: 11155111,
}

export function getChainIdByNetwork(network: EthereumNetwork) {
  return NETWORK_TO_CHAIN_ID[network]
}

import { AcreContracts } from "../contracts"
import { EthereumContractRunner } from "./contract"
import { EthereumBitcoinDepositor } from "./bitcoin-depositor"
import { EthereumNetwork } from "./network"
import { EthereumStBTC } from "./stbtc"
import EthereumBitcoinRedeemer from "./bitcoin-redeemer"

export * from "./bitcoin-depositor"
export * from "./address"
export { EthereumContractRunner }

function getEthereumContracts(
  runner: EthereumContractRunner,
  network: EthereumNetwork,
): AcreContracts {
  const bitcoinDepositor = new EthereumBitcoinDepositor({ runner }, network)
  const stBTC = new EthereumStBTC({ runner }, network)
  const bitcoinRedeemer = new EthereumBitcoinRedeemer({ runner }, network)

  return { bitcoinDepositor, stBTC, bitcoinRedeemer }
}

export { getEthereumContracts, EthereumNetwork, EthereumBitcoinRedeemer }

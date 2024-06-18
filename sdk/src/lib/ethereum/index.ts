import { AcreContracts } from "../contracts"
import { EthereumSigner } from "./contract"
import { EthereumBitcoinDepositor } from "./bitcoin-depositor"
import { EthereumNetwork } from "./network"
import { EthereumStBTC } from "./stbtc"
import EthereumBitcoinRedeemer from "./bitcoin-redeemer"

export * from "./bitcoin-depositor"
export * from "./address"
export { EthereumSigner }

function getEthereumContracts(
  signer: EthereumSigner,
  network: EthereumNetwork,
): AcreContracts {
  const bitcoinDepositor = new EthereumBitcoinDepositor({ signer }, network)
  const stBTC = new EthereumStBTC({ signer }, network)
  const bitcoinRedeemer = new EthereumBitcoinRedeemer({ signer }, network)

  return { bitcoinDepositor, stBTC, bitcoinRedeemer }
}

export { getEthereumContracts, EthereumNetwork, EthereumBitcoinRedeemer }

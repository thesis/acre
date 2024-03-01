import { AcreContracts } from "../contracts"
import { EthereumSigner } from "./contract"
import { EthereumBitcoinDepositor } from "./bitcoin-depositor"
import { EthereumNetwork } from "./network"

export * from "./eip712-signer"
export * from "./bitcoin-depositor"
export * from "./address"
export { EthereumSigner }

function getEthereumContracts(
  signer: EthereumSigner,
  network: EthereumNetwork,
): AcreContracts {
  const bitcoinDepositor = new EthereumBitcoinDepositor({ signer }, network)

  return { bitcoinDepositor }
}

export { getEthereumContracts, EthereumNetwork }

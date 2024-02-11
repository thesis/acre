import { AcreContracts } from "../contracts"
import { EthereumSigner } from "./contract"
import { EthereumTBTCDepositor } from "./tbtc-depositor"
import { EthereumNetwork } from "./network"
import EtherumStBTC from "./stbtc"

export * from "./eip712-signer"
export * from "./address"
export { EthereumSigner }

function getEthereumContracts(
  signer: EthereumSigner,
  network: EthereumNetwork,
): AcreContracts {
  const tbtcDepositor = new EthereumTBTCDepositor({ signer }, network)
  const stBTC = new EtherumStBTC({ signer }, network)

  return { tbtcDepositor, stBTC }
}

export { EthereumTBTCDepositor, getEthereumContracts, EthereumNetwork }

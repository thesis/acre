import { AcreContracts } from "../contracts"
import { EthereumSigner } from "./contract"
import { EthereumTBTCDepositor } from "./tbtc-depositor"

export * from "./contract"
export * from "./eip712-signer"
export * from "./address"

export type EthereumNetwork = "mainnet" | "sepolia" | "goerli"

export function getEthereumContracts(
  signer: EthereumSigner,
  // TODO: Once we have artifacts for contracts we can pass the network to
  // contract constructor and pass correct contract address and abi based on the
  // network param.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  network: EthereumNetwork,
): AcreContracts {
  const depositor = new EthereumTBTCDepositor({ signer })

  return { depositor }
}

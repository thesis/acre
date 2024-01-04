import {
  EthersContractConfig as _EthersContractConfig,
  EthersContractDeployment,
} from "@keep-network/tbtc-v2.ts/dist/src/lib/ethereum/adapter"
import {
  Contract as EthersContract,
  getAddress,
  Signer,
  Provider,
} from "ethers"
import { EthereumAddress } from "./address"

export type EthereumSigner = Signer | Provider

export interface EthersContractConfig
  extends Omit<_EthersContractConfig, "signerOrProvider"> {
  signerOrProvider: EthereumSigner
}

export class EthersContractWrapper<T extends EthersContract> {
  /**
   * Ethers instance of the deployed contract.
   */
  protected readonly instance: T

  /**
   * Number of a block within which the contract was deployed. Value is read
   * from the contract deployment artifact. It can be overwritten by setting a
   * {@link EthersContractConfig.deployedAtBlockNumber} property.
   */
  protected readonly deployedAtBlockNumber: number

  /**
   * Address of this contract instance.
   */
  readonly #address: string

  constructor(
    config: EthersContractConfig,
    deployment: EthersContractDeployment,
  ) {
    const contractAddress = config.address ?? getAddress(deployment.address)
    this.instance = new EthersContract(
      contractAddress,
      `${JSON.stringify(deployment.abi)}`,
      config.signerOrProvider,
    ) as T

    this.#address = contractAddress

    this.deployedAtBlockNumber =
      config.deployedAtBlockNumber ?? deployment.receipt.blockNumber
  }

  /**
   * Get address of the contract instance.
   * @returns Address of this contract instance.
   */
  getAddress(): EthereumAddress {
    return EthereumAddress.from(this.#address)
  }
}

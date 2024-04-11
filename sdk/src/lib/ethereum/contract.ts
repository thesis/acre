import {
  Contract as EthersContract,
  getAddress,
  Signer,
  VoidSigner,
} from "ethers"
import { EthereumAddress } from "./address"

/**
 * Contract deployment artifact.
 * @see [hardhat-deploy#Deployment](https://github.com/wighawag/hardhat-deploy/blob/0c969e9a27b4eeff9f5ccac7e19721ef2329eed2/types.ts#L358)}
 */
export interface EthersContractDeployment {
  /**
   * Address of the deployed contract.
   */
  address: string
  /**
   * Contract's ABI.
   */
  abi: unknown[]
}

/**
 * Use `VoidSigner` from `ethers` if you want to initialize the Ethereum Acre
 * SDK in readonly mode.
 */
export type EthereumSigner = Signer | VoidSigner

/**
 * Represents a config set required to connect an Ethereum contract.
 */
export interface EthersContractConfig {
  /**
   * Address of the Ethereum contract as a 0x-prefixed hex string.
   * Optional parameter, if not provided the value will be resolved from the
   * contract artifact.
   */
  address?: string
  /**
   * Signer - will return a Contract which will act on behalf of that signer. The signer will sign all contract transactions.
   */
  signer: EthereumSigner
}

/**
 * Ethers-based contract implementation.
 */
export class EthersContractWrapper<T extends EthersContract> {
  /**
   * Ethers instance of the deployed contract.
   */
  protected readonly instance: T

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
      config.signer,
    ) as T

    this.#address = contractAddress
  }

  /**
   * Get address of the contract instance.
   * @returns Address of this contract instance.
   */
  getAddress(): EthereumAddress {
    return EthereumAddress.from(this.#address)
  }
}

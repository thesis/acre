import { ChainIdentifier } from "../contracts"
import { Hex } from "../utils"
import { ChainSignedMessage } from "./signed-message"

/**
 * Definition of domain separator.
 */
export type Domain = {
  /**
   *  The user readable name of signing domain, i.e. the name of the DApp or the
   *  protocol.
   */
  name: string

  /**
   * The current major version of the signing domain. Signatures from different
   * versions are not compatible.
   */
  version: string

  /**
   * The EIP-155 chain id.
   */
  chainId?: number | bigint

  /**
   * The address of the contract that will verify the signature.
   */
  verifyingContract: ChainIdentifier

  /**
   * An disambiguating salt for the protocol. This can be used as a domain
   * separator of last resort.
   */
  salt?: Hex
}

/**
 * Definition of data structure to be signed.
 */
export type Types = Record<string, { name: string; type: string }[]>

/**
 * Message data.
 */
export type Message = Record<string, unknown>

/**
 * Interface for typed structured data signer.
 * @dev The main idea is to hide the signing process under the exact
 *      implementation for a given chain. For example, we can use `ethers` lib
 *      for Ethereum implementation, but different lib for other chains.
 */
export interface ChainEIP712Signer {
  /**
   * Signs defined typed structured data.
   * @param {Domain} domain - Definition of domain separator.
   * @param {Types} types - Data types.
   * @param {Message} message - Message data.
   * @returns {ChainSignedMessage} Object that represents chain-specific signed message.
   */
  sign(
    domain: Domain,
    types: Types,
    message: Message,
  ): Promise<ChainSignedMessage>
}

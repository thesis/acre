import { ChainIdentifier } from "./chain-identifier"

export interface BitcoinRedeemer {
  /**
   * @returns The chain-specific identifier of this contract.
   */
  getChainIdentifier(): ChainIdentifier
}

import { ChainIdentifier } from "../contracts"
import { Hex } from "../utils"

export type V = 0 | 1 | 27 | 28
export interface ChainSignedMessage {
  readonly v: V
  readonly r: Hex
  readonly s: Hex
  readonly signature: Hex
  verify(): ChainIdentifier
}

// The main idea is to hide the signing process under the exact implementation
// for a given chain. For example, we can use `ethers` lib for Ethereum
// implementation, but different lib for other chains.
export interface ChainMessages {
  sign(message: string): Promise<ChainSignedMessage>
}

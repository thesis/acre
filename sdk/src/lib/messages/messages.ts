import { Hex } from "../utils"

export type SignedMessage = {
  v: 0 | 1 | 27 | 28
  r: Hex
  s: Hex
  signature: Hex
}

// The main idea is to hide the signing process under the exact implementation
// for a given chain. For example, we can use `ethers` lib for Ethereum
// implementation, but different lib for other chains.
export interface ChainMessages {
  sign(message: string): Promise<SignedMessage>
}

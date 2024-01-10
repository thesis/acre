import { ChainSignedMessage } from "./signed-message"

// The main idea is to hide the signing process under the exact implementation
// for a given chain. For example, we can use `ethers` lib for Ethereum
// implementation, but different lib for other chains.
export interface ChainMessageSigner {
  sign(message: string): Promise<ChainSignedMessage>
}

import { ChainIdentifier } from "../contracts"
import { Hex } from "../utils"
import { ChainSignedMessage } from "./signed-message"

export type Domain = {
  name: string
  version: string
  chainId: number
  verifyingContract: ChainIdentifier
  salt?: Hex
}

export type Types = Record<string, { name: string; type: string }[]>

export type Message = Record<string, unknown>

// The main idea is to hide the signing process under the exact implementation
// for a given chain. For example, we can use `ethers` lib for Ethereum
// implementation, but different lib for other chains.
export interface ChainEIP712Signer {
  sign(
    domain: Domain,
    types: Types,
    message: Message,
  ): Promise<ChainSignedMessage>
}

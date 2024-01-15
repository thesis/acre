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

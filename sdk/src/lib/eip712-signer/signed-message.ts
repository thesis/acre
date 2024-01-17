import { ChainIdentifier } from "../contracts"
import { Hex } from "../utils"

/**
 * The v value of the signature. Since a given x value for r has two possible
 * values for its corresponding y, the v indicates which of the two y values to
 * use. It is usually normalized to the values 27 or 28.
 */
export type V = 0 | 1 | 27 | 28

/**
 * Represents signed message.
 */
export interface ChainSignedMessage {
  /**
   * @readonly The v value of the signature.
   * @see V for more details.
   */
  readonly v: V

  /**
   * @readonly The r value of the signature. This represents the x coordinate of
   *           a "reference" or challenge point, from which the y can be
   *           computed.
   */
  readonly r: Hex
  /**
   * @readonly The s value of the signature.
   */
  readonly s: Hex

  /**
   * Signature of signed message.
   */
  readonly signature: Hex

  /**
   * @returns The chain-specific identifier that produced the signature.
   */
  verify(): ChainIdentifier
}

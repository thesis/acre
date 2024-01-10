import { verifyMessage, Signature } from "ethers"
import { EthereumAddress } from "../address"
import { ChainSignedMessage, V } from "../../message-signer"
import { ChainIdentifier } from "../../contracts"
import { Hex } from "../../utils"

class EthereumSignedMessage implements ChainSignedMessage {
  static fromRaw(rawSignature: Hex, message: string): EthereumSignedMessage {
    const { v, r, s } = Signature.from(rawSignature.toPrefixedString())

    return new EthereumSignedMessage(
      rawSignature,
      v,
      Hex.from(r),
      Hex.from(s),
      message,
    )
  }

  /**
   * Message format to verify signature.
   */
  readonly #message: string

  constructor(
    readonly signature: Hex,
    readonly v: V,
    readonly r: Hex,
    readonly s: Hex,
    _message: string,
  ) {
    this.#message = _message
  }

  verify(): ChainIdentifier {
    const addressFromSignature = verifyMessage(
      this.#message,
      this.signature.toPrefixedString(),
    )

    return EthereumAddress.from(addressFromSignature)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumSignedMessage }

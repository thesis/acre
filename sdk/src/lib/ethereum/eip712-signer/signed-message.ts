import { Signature, verifyTypedData } from "ethers"
import { EthereumAddress } from "../address"
import {
  ChainSignedMessage,
  Message,
  Types,
  Domain,
  V,
} from "../../eip712-signer"
import { ChainIdentifier } from "../../contracts"
import { Hex } from "../../utils"

type TypedMessage = { domain: Domain; types: Types; message: Message }

class EthereumSignedMessage implements ChainSignedMessage {
  static fromRaw(
    rawSignature: Hex,
    typedMessage: TypedMessage,
  ): EthereumSignedMessage {
    const { v, r, s } = Signature.from(rawSignature.toPrefixedString())

    return new EthereumSignedMessage(
      rawSignature,
      v,
      Hex.from(r),
      Hex.from(s),
      typedMessage,
    )
  }

  /**
   * Message format to verify signature.
   */
  readonly #typedMessage: TypedMessage

  constructor(
    readonly signature: Hex,
    readonly v: V,
    readonly r: Hex,
    readonly s: Hex,
    _typedMessage: TypedMessage,
  ) {
    this.#typedMessage = _typedMessage
  }

  verify(): ChainIdentifier {
    const ethersDomain = {
      ...this.#typedMessage.domain,
      verifyingContract: `0x${this.#typedMessage.domain.verifyingContract.identifierHex}`,
      salt: this.#typedMessage.domain.salt?.toPrefixedString(),
    }

    const addressFromSignature = verifyTypedData(
      ethersDomain,
      this.#typedMessage.types,
      this.#typedMessage.message,
      this.signature.toPrefixedString(),
    )

    return EthereumAddress.from(addressFromSignature)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumSignedMessage }

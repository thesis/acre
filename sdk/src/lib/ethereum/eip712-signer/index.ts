import { EthereumSignedMessage } from "./signed-message"
import { EthereumSigner } from "../contract"
import {
  ChainEIP712Signer,
  ChainSignedMessage,
  Domain,
  Types,
  Message,
} from "../../eip712-signer"
import { Hex } from "../../utils"

class EthereumEIP712Signer implements ChainEIP712Signer {
  readonly #signer: EthereumSigner

  constructor(_signer: EthereumSigner) {
    this.#signer = _signer
  }

  async sign(
    domain: Domain,
    types: Types,
    message: Message,
  ): Promise<ChainSignedMessage> {
    const ethersDomain = {
      ...domain,
      verifyingContract: `0x${domain.verifyingContract.identifierHex}`,
      salt: domain.salt?.toPrefixedString(),
    }

    const rawSignature = await this.#signer.signTypedData(
      ethersDomain,
      types,
      message,
    )

    return EthereumSignedMessage.fromRaw(Hex.from(rawSignature), {
      domain,
      types,
      message,
    })
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumEIP712Signer }

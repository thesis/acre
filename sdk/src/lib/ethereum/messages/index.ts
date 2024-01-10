import { EthereumSignedMessage } from "./signed-message"
import { EthereumSigner } from "../contract"
import { ChainMessageSigner, ChainSignedMessage } from "../../message-signer"
import { Hex } from "../../utils"

class EthereumMessageSigner implements ChainMessageSigner {
  readonly #signer: EthereumSigner

  constructor(_signer: EthereumSigner) {
    this.#signer = _signer
  }

  async sign(message: string): Promise<ChainSignedMessage> {
    const rawSignature = await this.#signer.signMessage(message)

    return EthereumSignedMessage.fromRaw(Hex.from(rawSignature), message)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumMessageSigner }

import { Signer } from "ethers"
import { ChainMessages, ChainSignedMessage } from "../../messages"
import { EthereumSignedMessage } from "./signed-message"
import { Hex } from "../../utils"

class EthereumMessages implements ChainMessages {
  readonly #signer: Signer

  constructor(_signer: Signer) {
    this.#signer = _signer
  }

  async sign(message: string): Promise<ChainSignedMessage> {
    const rawSignature = await this.#signer.signMessage(message)

    return EthereumSignedMessage.fromRaw(Hex.from(rawSignature), message)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumMessages }

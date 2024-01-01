import { ChainMessages, SignedMessage } from "../messages"
import { Signer } from "./contract"

class EthereumMessages implements ChainMessages {
  #signer: Signer

  constructor(_signer: Signer) {
    this.#signer = _signer
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  sign(message: string): Promise<SignedMessage> {
    // TODO: add implementation
    throw new Error("Method not implemented.")
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumMessages }

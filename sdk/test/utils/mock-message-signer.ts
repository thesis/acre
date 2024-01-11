import {
  ChainMessageSigner,
  ChainSignedMessage,
} from "../../src/lib/message-signer"

// eslint-disable-next-line import/prefer-default-export
export class MockMessageSigner implements ChainMessageSigner {
  constructor() {
    this.sign = jest.fn()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  sign(message: string): Promise<ChainSignedMessage> {
    throw new Error("Method not implemented.")
  }
}

MockMessageSigner.prototype.sign = jest.fn()

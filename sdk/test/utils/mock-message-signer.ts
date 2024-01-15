import {
  ChainEIP712Signer,
  ChainSignedMessage,
  Domain,
  Message,
  Types,
} from "../../src/lib/eip712-signer"

// eslint-disable-next-line import/prefer-default-export
export class MockMessageSigner implements ChainEIP712Signer {
  // eslint-disable-next-line class-methods-use-this
  sign(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    domain: Domain,
    types: Types,
    message: Message,
    /* eslint-enable */
  ): Promise<ChainSignedMessage> {
    throw new Error("Method not implemented.")
  }
}

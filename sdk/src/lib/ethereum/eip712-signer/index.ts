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

/**
 * Ethereum implementation of typed structured data signer.
 * @see ChainEIP712Signer
 */
class EthereumEIP712Signer implements ChainEIP712Signer {
  readonly #signer: EthereumSigner

  constructor(_signer: EthereumSigner) {
    this.#signer = _signer
  }

  /**
   * @see {ChainEIP712Signer#sign}
   */
  async sign(
    domain: Domain,
    types: Types,
    message: Message,
  ): Promise<ChainSignedMessage> {
    const chainId = await this.#getChainId()
    if (!chainId) throw new Error("Chain id not defined")

    const ethersDomain = {
      ...domain,
      chainId,
      verifyingContract: `0x${domain.verifyingContract.identifierHex}`,
      salt: domain.salt?.toPrefixedString(),
    }

    const rawSignature = await this.#signer.signTypedData(
      ethersDomain,
      types,
      message,
    )

    return EthereumSignedMessage.fromRaw(Hex.from(rawSignature), {
      domain: { ...domain, chainId },
      types,
      message,
    })
  }

  /**
   * Gets the chain id from the network the signer is connected to.
   * @returns The EIP-155 chain id.
   */
  async #getChainId() {
    const network = await this.#signer.provider?.getNetwork()

    return network?.chainId
  }
}

export { EthereumEIP712Signer, EthereumSignedMessage }

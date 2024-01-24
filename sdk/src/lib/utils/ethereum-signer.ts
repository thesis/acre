import { AbstractSigner } from "ethers"

/**
 * This abstract signer adds necessary methods to be compatible with ethers v5
 * signer which is used in tBTC-v2.ts SDK.
 */
abstract class EthereumSignerCompatibleWithEthersV5 extends AbstractSigner {
  /**
   * @dev Required by ethers v5.
   */
  readonly _isSigner: boolean = true

  // eslint-disable-next-line no-underscore-dangle
  _checkProvider() {
    if (!this.provider) throw new Error("Provider not available")
  }

  /**
   * @dev Required by ethers v5.
   */
  async getChainId(): Promise<number> {
    // eslint-disable-next-line no-underscore-dangle
    this._checkProvider()

    const network = await this.provider!.getNetwork()

    return Number(network.chainId)
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumSignerCompatibleWithEthersV5 }

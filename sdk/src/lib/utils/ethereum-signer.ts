import { VoidSigner as EthersVoidSigner, Signer } from "ethers"

/**
 * This abstract signer interface that defines necessary methods to be
 * compatible with ethers v5 signer which is used in tBTC-v2.ts SDK.
 */
export interface IEthereumSignerCompatibleWithEthersV5 extends Signer {
  /**
   * @dev Required by ethers v5.
   */
  readonly _isSigner: boolean

  // eslint-disable-next-line no-underscore-dangle
  _checkProvider(): void

  /**
   * @dev Required by ethers v5.
   */
  getChainId(): Promise<number>
}

export class VoidSigner
  extends EthersVoidSigner
  implements IEthereumSignerCompatibleWithEthersV5
{
  readonly _isSigner: boolean = true

  // eslint-disable-next-line no-underscore-dangle
  _checkProvider() {
    if (!this.provider) throw new Error("Provider not available")
  }

  async getChainId(): Promise<number> {
    // eslint-disable-next-line no-underscore-dangle
    this._checkProvider()

    const network = await this.provider!.getNetwork()

    return Number(network.chainId)
  }
}

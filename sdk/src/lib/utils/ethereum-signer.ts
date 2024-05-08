/* eslint-disable max-classes-per-file */
import { VoidSigner, AbstractSigner } from "ethers"

type AbstractSignerConstructor<T extends AbstractSigner = AbstractSigner> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract new (...args: any[]) => T

/**
 * This abstract signer interface that defines necessary methods to be
 * compatible with ethers v5 signer which is used in tBTC-v2.ts SDK.
 */
export interface IEthereumSignerCompatibleWithEthersV5 extends AbstractSigner {
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

function ethereumSignerCompatibleWithEthersV5Mixin<
  T extends AbstractSignerConstructor,
>(SignerBase: T) {
  /**
   * This abstract signer adds necessary methods to be compatible with ethers v5
   * signer which is used in tBTC-v2.ts SDK.
   */
  abstract class EthereumSignerCompatibleWithEthersV5
    extends SignerBase
    implements IEthereumSignerCompatibleWithEthersV5
  {
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

  return EthereumSignerCompatibleWithEthersV5
}

export const EthereumSignerCompatibleWithEthersV5 =
  ethereumSignerCompatibleWithEthersV5Mixin(AbstractSigner)

export const VoidSignerCompatibleWithEthersV5 =
  ethereumSignerCompatibleWithEthersV5Mixin(VoidSigner)

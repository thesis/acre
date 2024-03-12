import {
  BitcoinRawTxVectors,
  DepositorProxy,
  EthereumBitcoinDepositor,
  ChainIdentifier,
  DepositReceipt,
  Hex,
  packRevealDepositParameters,
  BitcoinDepositor,
} from "@acre-btc/sdk"
import axios from "axios"

const DEFENDER_WEBHOOK_URL = import.meta.env.VITE_DEFENDER_RELAYER_WEBHOOK_URL

/**
 * Implementation of @see DepositorProxy that redirects stake requests to the
 * Open Zeppelin Defender Relayer which initializes stake on the user's behalf.
 * Sends the HTTP POST request to the webhook at the provided URL with the data
 * necessary to initialize stake.
 */
class RelayerDepositorProxy<T extends BitcoinDepositor>
  implements DepositorProxy
{
  /**
   * Chain-specific handle to @see BitcoinDepositor contract.
   */
  #bitcoinDepositor: T

  /**
   * Defines the Open Zeppelin Defender webhook URL.
   */
  #defenderWebhookUrl: string

  /**
   * Creates the instance of the relayer depositor proxy for Ethereum chain.
   * @param bitcoinDepositor Ethereum handle to @see BitcoinDepositor contract.
   * @returns Instance of @see RelayerDepositorProxy.
   */
  static fromEthereumBitcoinDepositor(
    bitcoinDepositor: EthereumBitcoinDepositor,
  ): RelayerDepositorProxy<EthereumBitcoinDepositor> {
    return new RelayerDepositorProxy(bitcoinDepositor, DEFENDER_WEBHOOK_URL)
  }

  private constructor(_bitcoinDepositor: T, _defenderWebhookUr: string) {
    this.#bitcoinDepositor = _bitcoinDepositor
    this.#defenderWebhookUrl = _defenderWebhookUr
  }

  /**
   * @see {DepositorProxy#getChainIdentifier}
   */
  getChainIdentifier(): ChainIdentifier {
    return this.#bitcoinDepositor.getChainIdentifier()
  }

  /**
   * @see {DepositorProxy#revealDeposit}
   * @dev Sends HTTP POST request to Open Zeppelin Defender Relayer.
   */
  async revealDeposit(
    depositTx: BitcoinRawTxVectors,
    depositOutputIndex: number,
    deposit: DepositReceipt,
  ): Promise<Hex> {
    const { fundingTx, reveal, extraData } = packRevealDepositParameters(
      depositTx,
      depositOutputIndex,
      deposit,
      await this.#bitcoinDepositor.getTbtcVaultChainIdentifier(),
    )

    if (!extraData) throw new Error("Invalid extra data")

    const { staker, referral } =
      this.#bitcoinDepositor.decodeExtraData(extraData)

    // TODO: Catch and handle errors + sentry.
    const response = await axios.post<{ result: string }>(
      this.#defenderWebhookUrl,
      {
        fundingTx,
        reveal,
        staker: `0x${staker.identifierHex}`,
        referral,
      },
    )

    // Defender returns result as string so we need to parse it.
    const { txHash } = JSON.parse(response.data.result) as { txHash: string }

    return Hex.from(txHash)
  }
}

export { RelayerDepositorProxy }

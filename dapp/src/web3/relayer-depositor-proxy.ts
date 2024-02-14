import {
  BitcoinRawTxVectors,
  DepositorProxy,
  EthereumTBTCDepositor,
  ChainIdentifier,
  DepositReceipt,
  Hex,
  packRevealDepositParameters,
  TBTCDepositor,
} from "@acre-btc/sdk"
import axios from "axios"

const DEFENDER_WEBHOOK_URL = import.meta.env.VITE_DEFENDER_RELAYER_WEBHOOK_URL

class RelayerDepositorProxy<T extends TBTCDepositor> implements DepositorProxy {
  #tbtcDepositor: T

  #defenderWebhookUrl: string

  static fromEthereumTbtcDepositor(tbtcDepositor: EthereumTBTCDepositor) {
    return new RelayerDepositorProxy(tbtcDepositor, DEFENDER_WEBHOOK_URL)
  }

  private constructor(_tbtcDepositor: T, _defenderWebhookUr: string) {
    this.#tbtcDepositor = _tbtcDepositor
    this.#defenderWebhookUrl = _defenderWebhookUr
  }

  getChainIdentifier(): ChainIdentifier {
    return this.#tbtcDepositor.getChainIdentifier()
  }

  async revealDeposit(
    depositTx: BitcoinRawTxVectors,
    depositOutputIndex: number,
    deposit: DepositReceipt,
  ): Promise<Hex> {
    const { fundingTx, reveal, extraData } = packRevealDepositParameters(
      depositTx,
      depositOutputIndex,
      deposit,
      await this.#tbtcDepositor.getTbtcVaultChainIdentifier(),
    )

    if (!extraData) throw new Error("Invalid extra data")

    const { staker, referral } = this.#tbtcDepositor.decodeExtraData(extraData)

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

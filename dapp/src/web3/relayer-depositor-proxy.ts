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

// TODO: Get this URL from env variable.
const DEFENDER_WEBHOOK_URL =
  "https://api.defender.openzeppelin.com/actions/a0d6d2e2-ce9c-4619-aa2b-6c874fe97af7/runs/webhook/b1f17c89-8230-46e3-866f-a3213887974c/Sbddsy54cJ6sPg2bLPyuHJ"

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
    const response = await axios.post<{ txHash: string }>(
      this.#defenderWebhookUrl,
      {
        fundingTx,
        reveal,
        staker: `0x${staker.identifierHex}`,
        referral,
      },
    )

    const { txHash } = response.data

    return Hex.from(txHash)
  }
}

export { RelayerDepositorProxy }

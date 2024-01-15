import {
  BitcoinClient,
  ChainIdentifier,
  Deposit,
  extractBitcoinRawTxVectors,
} from "@keep-network/tbtc-v2.ts"
import { ChainEIP712Signer } from "../../lib/message-signer"
import { AcreContracts } from "../../lib/contracts"
import { Hex } from "../../lib/utils"

class StakeInitialization {
  readonly #contracts: AcreContracts

  readonly #messageSigner: ChainEIP712Signer

  readonly #deposit: Deposit

  readonly #bitcoinClient: BitcoinClient

  readonly #receiver: ChainIdentifier

  readonly #referral: number

  constructor(
    _contracts: AcreContracts,
    _message: ChainEIP712Signer,
    _receiver: ChainIdentifier,
    _referral: number,
    _deposit: Deposit,
    _bitcoinClient: BitcoinClient,
  ) {
    this.#contracts = _contracts
    this.#messageSigner = _message
    this.#receiver = _receiver
    this.#referral = _referral
    this.#deposit = _deposit
    this.#bitcoinClient = _bitcoinClient
  }

  async getBitcoinAddress(): Promise<string> {
    return this.#deposit.getBitcoinAddress()
  }

  async stake(receiver: ChainIdentifier): Promise<Hex> {
    const addressFromSignature = this.#message.verify()

    if (!receiver.equals(addressFromSignature)) {
      throw new Error("Invalid receiver address")
    }

    const utxos = await this.#deposit.detectFunding()

    if (utxos.length === 0) {
      throw new Error("Deposit not found yet")
    }

    // Take the most recent one.
    // TODO: Add support to pick exact funding tx.
    const { transactionHash, outputIndex } = utxos[0]

    const depositFundingTx = extractBitcoinRawTxVectors(
      await this.#bitcoinClient.getRawTransaction(transactionHash),
    )

    const depositScript = this.#deposit.getReceipt()

    const revealDepositInfo = {
      fundingOutputIndex: outputIndex,
      blindingFactor: depositScript.blindingFactor,
      walletPublicKeyHash: depositScript.walletPublicKeyHash,
      refundPublicKeyHash: depositScript.refundPublicKeyHash,
      refundLocktime: depositScript.refundLocktime,
    }

    return this.#contracts.depositor.initializeStake(
      depositFundingTx,
      revealDepositInfo,
      this.#receiver,
      this.#referral,
    )
  }
}

// eslint-disable-next-line import/prefer-default-export
export { StakeInitialization }
